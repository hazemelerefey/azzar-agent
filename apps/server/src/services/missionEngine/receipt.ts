import { MissionModel } from '@/database/models/mission';

import type { MissionDAG } from './dag';
import type { MissionReceipt, NodeStatus, ReceiptApprovalStep, ReceiptToolCall } from './types';

/** LLM usage counters contain "token" but are not secrets. */
const NON_SECRET_TOKEN_COUNT_KEYS = new Set([
  'completiontokens',
  'prompttokens',
  'tokens',
  'tokenrollup',
  'tokensused',
  'tokenusage',
  'totaltokens',
]);

export class MissionReceiptManager {
  private missionModel: MissionModel;

  constructor(missionModel?: MissionModel) {
    this.missionModel = missionModel || new MissionModel();
  }

  /**
   * Redact sensitive secrets from payloads: by key name (tokens, keys, passwords,
   * authorization, cookies, credentials) and by value shape (Bearer headers, provider
   * key prefixes, JWTs, secrets in URL query strings), at any depth.
   */
  static redactSecrets(obj: any): any {
    if (typeof obj === 'string') {
      return MissionReceiptManager.redactString(obj);
    }
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => MissionReceiptManager.redactSecrets(item));
    }

    const redacted: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const lower = key.toLowerCase();
      if (
        !NON_SECRET_TOKEN_COUNT_KEYS.has(lower) &&
        (lower.includes('secret') ||
          lower.includes('token') ||
          lower.includes('password') ||
          lower.includes('passwd') ||
          lower.includes('authorization') ||
          lower.includes('cookie') ||
          lower.includes('credential') ||
          lower.includes('private_key') ||
          lower.includes('privatekey') ||
          lower.includes('apikey') ||
          lower.includes('api_key') ||
          lower.includes('api-key'))
      ) {
        redacted[key] = '[REDACTED]';
      } else {
        redacted[key] = MissionReceiptManager.redactSecrets(value);
      }
    }
    return redacted;
  }

  static redactString(value: string): string {
    return value
      .replaceAll(/\bBearer\s+[\w+./~=-]{8,}/gi, 'Bearer [REDACTED]')
      .replaceAll(/\bsk-[\w-]{16,}/g, '[REDACTED]')
      .replaceAll(/\bgh[opsu]_\w{20,}/g, '[REDACTED]')
      .replaceAll(/\bAKIA[\dA-Z]{16}\b/g, '[REDACTED]')
      .replaceAll(/\beyJ[\w-]{8,}\.[\w-]{8,}\.[\w-]{8,}/g, '[REDACTED]')
      .replaceAll(
        /([?&](?:api[_-]?key|access[_-]?token|token|secret|password|key)=)[^&\s]+/gi,
        '$1[REDACTED]',
      );
  }

  /**
   * Build the complete receipt record for a mission.
   */
  buildReceipt(params: {
    approvalStep?: ReceiptApprovalStep;
    costRollup?: { currency: string; totalCost: number };
    dag: MissionDAG;
    missionId: string;
    modelDisclosure: { model: string; provider: string };
    nodeStatuses: Record<string, NodeStatus>;
    tokenRollup?: { completionTokens: number; promptTokens: number; totalTokens: number };
    toolCalls: ReceiptToolCall[];
  }): MissionReceipt {
    const assignees: Record<string, string> = {};
    for (const node of params.dag.nodes) {
      assignees[node.id] = node.assignee;
    }

    const receipt: MissionReceipt = {
      approvalStep: params.approvalStep
        ? {
            consumedAt: params.approvalStep.consumedAt,
            decidedAt: params.approvalStep.decidedAt,
            decidedBy: params.approvalStep.decidedBy,
            decision: params.approvalStep.decision,
            nodeId: params.approvalStep.nodeId,
            shownPayloadHash: params.approvalStep.shownPayloadHash,
            toolId: params.approvalStep.toolId,
          }
        : undefined,
      assignees,
      costRollup: {
        costMethod:
          params.modelDisclosure.provider === 'ollama'
            ? `ollama_local_zero_cost:${params.modelDisclosure.provider}/${params.modelDisclosure.model}`
            : `provider_usage:${params.modelDisclosure.provider}/${params.modelDisclosure.model}`,
        currency: params.costRollup?.currency || 'USD',
        totalCost: params.costRollup?.totalCost ?? 0,
      },
      dagTopology: {
        edges: params.dag.getEdges(),
        nodes: params.dag.nodes.map((n) => n.id),
      },
      missionId: params.missionId,
      modelDisclosure: params.modelDisclosure,
      nodeStatuses: { ...params.nodeStatuses },
      tokenRollup: params.tokenRollup || {
        completionTokens: 0,
        promptTokens: 0,
        totalTokens: 0,
      },
      toolCalls: params.toolCalls.map((tc) => ({
        input: MissionReceiptManager.redactSecrets(tc.input),
        output: MissionReceiptManager.redactSecrets(tc.output),
        sources: (tc.sources || []).map((s) => MissionReceiptManager.redactString(s)),
        toolCallId: tc.toolCallId,
        toolId: tc.toolId,
      })),
    };

    return receipt;
  }

  /**
   * Save receipt to the database.
   */
  async saveReceipt(receipt: MissionReceipt) {
    return this.missionModel.saveReceipt({
      missionId: receipt.missionId,
      receiptJson: receipt,
    });
  }

  /**
   * Retrieve receipt from the database.
   */
  async getReceipt(missionId: string): Promise<MissionReceipt | null> {
    const raw = await this.missionModel.getReceipt(missionId);
    if (!raw || !raw.receiptJson) {
      return null;
    }
    return raw.receiptJson as MissionReceipt;
  }
}
