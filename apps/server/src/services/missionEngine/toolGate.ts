import { MissionApprovalManager } from './approval';
import { MissionCheckpointManager } from './checkpoint';
import { MissionJournalManager } from './journal';
import type { CheckpointSnapshot, ReceiptToolCall } from './types';

/**
 * Tool execution wrapper (spec 2.5):
 * - Tap tools (spend, publish, external send, CRM write, handoff, ads spend) always
 *   require a consumed approval. Read tools do not.
 * - Ads spend is stripped by Rules unless explicitly granted.
 * - Checkpoint before every tap tool. Resume replays committed tool results by
 *   toolCallId and never re-executes a consumed tap tool.
 * Enforcement happens here, on the server, before the tool runs, whatever the prompt says.
 */

export type TapCategory = 'ads_spend' | 'crm_write' | 'external_send' | 'handoff' | 'publish' | 'spend';

export interface ToolGrants {
  /** Ads spend tools are stripped unless this is explicitly true. */
  adsSpend?: boolean;
}

const tokenize = (toolId: string): string[] =>
  toolId
    .replaceAll(/([a-z\d])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/[^\da-z]+/)
    .filter(Boolean);

/** Classify a tool id as a tap category, or null for a read/local tool. */
export function classifyTool(toolId: string): TapCategory | null {
  const tokens = new Set(tokenize(toolId));
  const joined = tokenize(toolId).join('');
  const has = (...words: string[]) => words.some((w) => tokens.has(w));

  if ((has('ads', 'ad') && has('spend', 'budget', 'buy')) || joined.includes('adsspend')) {
    return 'ads_spend';
  }
  if (has('spend', 'payment', 'pay', 'charge', 'purchase', 'checkout')) return 'spend';
  if (has('publish', 'post', 'tweet', 'broadcast')) return 'publish';
  if (has('send', 'email', 'sms', 'whatsapp', 'dm') && !has('read', 'list', 'get', 'search')) {
    return 'external_send';
  }
  if (has('crm') && has('write', 'update', 'create', 'upsert', 'delete', 'set')) return 'crm_write';
  if (has('handoff') || (has('hand') && has('off'))) return 'handoff';
  return null;
}

/** Remove ads-spend tools from the allowlist unless explicitly granted. */
export function resolveAllowedTools(
  allowedToolIds: string[] | undefined,
  grants: ToolGrants = {},
): string[] | undefined {
  if (!allowedToolIds) return undefined;
  return grants.adsSpend === true
    ? [...allowedToolIds]
    : allowedToolIds.filter((id) => classifyTool(id) !== 'ads_spend');
}

export class ToolNotAllowedError extends Error {
  constructor(
    readonly toolId: string,
    reason: string,
  ) {
    super(`Tool "${toolId}" is not allowed: ${reason}`);
    this.name = 'ToolNotAllowedError';
  }
}

export class TapApprovalRequiredError extends Error {
  constructor(
    readonly approvalId: string,
    readonly toolId: string,
    readonly toolCallId: string,
    readonly state: 'pending' | 'rejected',
  ) {
    super(
      state === 'pending'
        ? `Tap tool "${toolId}" requires a consumed approval: approval "${approvalId}" is pending`
        : `Tap tool "${toolId}" blocked: approval "${approvalId}" was rejected`,
    );
    this.name = 'TapApprovalRequiredError';
  }
}

export interface ToolExecutionRequest {
  /** Allowlist declared by the node. Ads-spend tools are stripped from it by default. */
  allowedToolIds?: string[];
  /** Committed tool results of this mission (replayed by toolCallId, never re-run). */
  committedToolResults: Record<string, any>;
  /** Current engine snapshot; required to checkpoint before a tap tool. */
  getSnapshot?: () => CheckpointSnapshot;
  grants?: ToolGrants;
  input: any;
  missionId: string;
  nodeId: string;
  /** Does the actual work. Only called after every rule passed. */
  run: () => Promise<ReceiptToolCall>;
  toolCallId: string;
  toolId: string;
}

export interface ToolExecutionResult {
  approvalId?: string;
  replayed: boolean;
  tap: TapCategory | null;
  toolCall: ReceiptToolCall;
}

export const tapApprovalId = (missionId: string, nodeId: string, toolCallId: string) =>
  `approval_${missionId}_${nodeId}_${toolCallId}`;

export class MissionToolGate {
  private approvals?: MissionApprovalManager;
  private checkpoints?: MissionCheckpointManager;
  private journal?: MissionJournalManager;

  constructor(
    private deps: {
      approvals?: MissionApprovalManager;
      checkpoints?: MissionCheckpointManager;
      journal?: MissionJournalManager;
    } = {},
  ) {}

  // Managers are created lazily so read-only tools never touch the database.
  private get approvalManager() {
    return (this.approvals ??= this.deps.approvals ?? new MissionApprovalManager());
  }
  private get checkpointManager() {
    return (this.checkpoints ??= this.deps.checkpoints ?? new MissionCheckpointManager());
  }
  private get journalManager() {
    return (this.journal ??= this.deps.journal ?? new MissionJournalManager());
  }

  async execute(req: ToolExecutionRequest): Promise<ToolExecutionResult> {
    const { missionId, nodeId, toolCallId, toolId } = req;
    const tap = classifyTool(toolId);

    // 1. Rules: the allowlist, with ads spend stripped unless explicitly granted.
    const allowed = resolveAllowedTools(req.allowedToolIds, req.grants);
    if (allowed && !allowed.includes(toolId)) {
      throw new ToolNotAllowedError(
        toolId,
        tap === 'ads_spend' && req.grants?.adsSpend !== true
          ? 'ads_spend tools are stripped unless explicitly granted'
          : `not in the allowed tools of node ${nodeId}`,
      );
    }
    if (tap === 'ads_spend' && req.grants?.adsSpend !== true) {
      throw new ToolNotAllowedError(toolId, 'ads_spend tools are stripped unless explicitly granted');
    }

    // 2. Replay: a committed result is returned as recorded, the tool is never re-executed.
    const committed = req.committedToolResults[toolCallId];
    if (committed) {
      return { replayed: true, tap, toolCall: committed as ReceiptToolCall };
    }

    // 3. Read tools run without approval.
    if (!tap) {
      return { replayed: false, tap, toolCall: await req.run() };
    }

    // 4. Tap tools: a consumed approval is mandatory, and a checkpoint precedes the call.
    if (!req.getSnapshot) {
      throw new Error(`Tap tool "${toolId}" cannot run without a checkpoint snapshot provider`);
    }
    const payload = { input: req.input, nodeId, toolCallId, toolId };
    const approvalId = tapApprovalId(missionId, nodeId, toolCallId);
    const existing = await this.approvalManager.getApproval(approvalId);

    if (!existing) {
      await this.approvalManager.createApproval({ id: approvalId, missionId, nodeId, payload, toolId });
      await this.saveBeforeTapCheckpoint(req, approvalId, 'approval_requested');
      throw new TapApprovalRequiredError(approvalId, toolId, toolCallId, 'pending');
    }
    if (existing.decision === 'rejected') {
      throw new TapApprovalRequiredError(approvalId, toolId, toolCallId, 'rejected');
    }
    if (existing.decision !== 'approved') {
      throw new TapApprovalRequiredError(approvalId, toolId, toolCallId, 'pending');
    }
    if (existing.consumedAt) {
      throw new Error(
        `Tap tool "${toolId}" will not re-execute: approval "${approvalId}" was already consumed and no committed result exists for "${toolCallId}"`,
      );
    }

    // Checkpoint BEFORE the tap tool, then consume (atomic, once; payload hash re-verified), then run.
    await this.saveBeforeTapCheckpoint(req, approvalId, 'before_tap_tool');
    await this.approvalManager.consumeApproval(approvalId, payload);

    const toolCall = await req.run();

    await this.journalManager.appendEvent({
      eventType: 'tool_result',
      missionId,
      payload: { approvalId, output: toolCall.output, sources: toolCall.sources, toolCallId },
      sourceEventId: toolCallId,
    });

    // Commit: the result and the consumed approval are recorded together.
    const snapshot = req.getSnapshot();
    await this.checkpointManager.saveCheckpoint(missionId, {
      ...snapshot,
      committedToolResults: { ...snapshot.committedToolResults, [toolCallId]: toolCall },
      consumedApprovalIds: [...new Set([...snapshot.consumedApprovalIds, approvalId])],
    });

    return { approvalId, replayed: false, tap, toolCall };
  }

  private async saveBeforeTapCheckpoint(
    req: ToolExecutionRequest,
    approvalId: string,
    kind: 'approval_requested' | 'before_tap_tool',
  ) {
    const snapshot = req.getSnapshot!();
    await this.checkpointManager.saveCheckpoint(req.missionId, {
      ...snapshot,
      checkpointKind: 'before_tap_tool',
      pendingTap: { approvalId, nodeId: req.nodeId, toolCallId: req.toolCallId, toolId: req.toolId },
    });
    await this.journalManager.appendEvent({
      eventType: 'before_tap_tool',
      missionId: req.missionId,
      payload: { approvalId, kind, nodeId: req.nodeId, toolCallId: req.toolCallId, toolId: req.toolId },
      sourceEventId: req.toolCallId,
    });
    await this.journalManager.appendEvent({
      eventType: 'tool_call',
      missionId: req.missionId,
      payload: { approvalId, input: req.input, toolCallId: req.toolCallId, toolId: req.toolId },
      sourceEventId: req.toolCallId,
    });
  }
}
