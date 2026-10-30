// @vitest-environment node
import { getTestDB } from '@azzar/database/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MissionModel } from '@/database/models/mission';

import { MissionApprovalManager } from '../approval';
import { MissionCheckpointManager } from '../checkpoint';
import { MissionEngine } from '../engine';
import { MissionJournalManager } from '../journal';
import { MARKETING_MISSION_DAG } from '../marketingMission';
import {
  classifyTool,
  MissionToolGate,
  resolveAllowedTools,
  TapApprovalRequiredError,
  tapApprovalId,
  ToolNotAllowedError,
} from '../toolGate';
import type { CheckpointSnapshot, ReceiptToolCall } from '../types';

const db = await getTestDB();
const model = new MissionModel(db);
const approvals = new MissionApprovalManager(model);
const checkpoints = new MissionCheckpointManager(model);
const journal = new MissionJournalManager(model);

const snapshot = (missionId: string): CheckpointSnapshot => ({
  committedToolResults: {},
  consumedApprovalIds: [],
  cost: 0,
  missionId,
  nodeStatuses: { N1: 'completed' },
  rounds: 1,
});

describe('tool classification and ads_spend stripping', () => {
  it('classifies tap tools and leaves read/local tools alone', () => {
    expect(classifyTool('ads____createAdsSpend')).toBe('ads_spend');
    expect(classifyTool('google-ads____ads_spend')).toBe('ads_spend');
    expect(classifyTool('billing____chargeCard')).toBe('spend');
    expect(classifyTool('social____publishPost')).toBe('publish');
    expect(classifyTool('gmail____sendEmail')).toBe('external_send');
    expect(classifyTool('crm____updateContact')).toBe('crm_write');
    expect(classifyTool('agents____handoff')).toBe('handoff');
    expect(classifyTool('web-browsing____search')).toBeNull();
    expect(classifyTool('agent-documents____readFile')).toBeNull();
    expect(classifyTool('local-system____writeFile')).toBeNull();
    expect(classifyTool('crm____listContacts')).toBeNull();
  });

  it('strips ads_spend tools from the allowlist unless explicitly granted', () => {
    const allowed = ['web-browsing____search', 'ads____createAdsSpend'];
    expect(resolveAllowedTools(allowed)).toEqual(['web-browsing____search']);
    expect(resolveAllowedTools(allowed, { adsSpend: false })).toEqual(['web-browsing____search']);
    expect(resolveAllowedTools(allowed, { adsSpend: true })).toEqual(allowed);
    expect(resolveAllowedTools(undefined)).toBeUndefined();
  });

  it('refuses an ads_spend tool before running it, even when the node declares it', async () => {
    const gate = new MissionToolGate({ approvals, checkpoints, journal });
    const run = vi.fn();
    await expect(
      gate.execute({
        allowedToolIds: ['ads____createAdsSpend'],
        committedToolResults: {},
        input: { budget: 100 },
        missionId: 'm_ads',
        nodeId: 'N3',
        run,
        toolCallId: 'tc_ads',
        toolId: 'ads____createAdsSpend',
      }),
    ).rejects.toThrow(ToolNotAllowedError);
    await expect(
      gate.execute({
        allowedToolIds: ['ads____createAdsSpend'],
        committedToolResults: {},
        input: { budget: 100 },
        missionId: 'm_ads',
        nodeId: 'N3',
        run,
        toolCallId: 'tc_ads',
        toolId: 'ads____createAdsSpend',
      }),
    ).rejects.toThrow(/ads_spend tools are stripped unless explicitly granted/);
    expect(run).not.toHaveBeenCalled();
  });

  it('rejects tools outside the node allowlist', async () => {
    const gate = new MissionToolGate({ approvals, checkpoints, journal });
    const run = vi.fn();
    await expect(
      gate.execute({
        allowedToolIds: ['web-browsing____search'],
        committedToolResults: {},
        input: {},
        missionId: 'm_x',
        nodeId: 'N1',
        run,
        toolCallId: 'tc_x',
        toolId: 'local-system____writeFile',
      }),
    ).rejects.toThrow(/not in the allowed tools of node N1/);
    expect(run).not.toHaveBeenCalled();
  });

  it('runs read tools without any approval and replays committed results by toolCallId', async () => {
    const gate = new MissionToolGate();
    const toolCall: ReceiptToolCall = {
      input: { q: 1 },
      output: 'ok',
      toolCallId: 'tc_read',
      toolId: 'web-browsing____search',
    };
    const run = vi.fn(async () => toolCall);
    const first = await gate.execute({
      allowedToolIds: ['web-browsing____search'],
      committedToolResults: {},
      input: { q: 1 },
      missionId: 'm_read',
      nodeId: 'N1',
      run,
      toolCallId: 'tc_read',
      toolId: 'web-browsing____search',
    });
    expect(first).toMatchObject({ replayed: false, tap: null });
    const replay = await gate.execute({
      allowedToolIds: ['web-browsing____search'],
      committedToolResults: { tc_read: toolCall },
      input: { q: 1 },
      missionId: 'm_read',
      nodeId: 'N1',
      run,
      toolCallId: 'tc_read',
      toolId: 'web-browsing____search',
    });
    expect(replay.replayed).toBe(true);
    expect(run).toHaveBeenCalledTimes(1);
  });
});

describe('tap tool gating against PostgreSQL (PGlite)', () => {
  const missionId = 'msn_tap_gate_1';
  const toolId = 'social____publishPost';
  const toolCallId = 'tc_publish_1';
  const approvalId = tapApprovalId(missionId, 'N4', toolCallId);
  const gate = new MissionToolGate({ approvals, checkpoints, journal });

  beforeEach(async () => {
    await model.create({ dagJson: {}, id: missionId, title: 'Tap gate mission' }).catch(() => {});
  });

  const request = (run: () => Promise<ReceiptToolCall>, committed: Record<string, any> = {}) => ({
    allowedToolIds: [toolId],
    committedToolResults: committed,
    getSnapshot: () => snapshot(missionId),
    input: { text: 'Launch post' },
    missionId,
    nodeId: 'N4',
    run,
    toolCallId,
    toolId,
  });

  it('blocks, checkpoints before the tap tool, consumes the approval once, and never re-executes', async () => {
    const result: ReceiptToolCall = {
      input: { text: 'Launch post' },
      output: { postId: 'p1' },
      sources: ['https://social.example/p1'],
      toolCallId,
      toolId,
    };
    const run = vi.fn(async () => result);

    // 1. No approval yet: a pending approval row is created, a before_tap_tool checkpoint is
    //    written, and the tool does NOT run.
    await expect(gate.execute(request(run))).rejects.toThrow(TapApprovalRequiredError);
    expect(run).not.toHaveBeenCalled();
    const pending = await model.getApproval(approvalId);
    expect(pending?.toolId).toBe(toolId);
    expect(pending?.decision).toBeNull();
    const cp1 = await checkpoints.getLatestCheckpoint(missionId);
    expect(cp1?.checkpointKind).toBe('before_tap_tool');
    expect(cp1?.pendingTap).toMatchObject({ approvalId, toolCallId, toolId });

    // 2. Still undecided: still blocked.
    await expect(gate.execute(request(run))).rejects.toThrow(/pending/);
    expect(run).not.toHaveBeenCalled();

    // 3. Human approves: tool runs exactly once and the approval is consumed.
    await approvals.decideApproval(approvalId, 'approved', 'Eng. Hazem Elerefy');
    const executed = await gate.execute(request(run));
    expect(executed).toMatchObject({ approvalId, replayed: false, tap: 'publish' });
    expect(run).toHaveBeenCalledTimes(1);
    const consumed = await model.getApproval(approvalId);
    expect(consumed?.consumedAt).toBeInstanceOf(Date);

    // The before_tap_tool journal entry precedes the tool_result.
    const events = await model.getJournal(missionId);
    const beforeIdx = events.findIndex(
      (e) => e.eventType === 'before_tap_tool' && (e.payloadJson as any).kind === 'before_tap_tool',
    );
    const resultIdx = events.findIndex((e) => e.eventType === 'tool_result');
    expect(beforeIdx).toBeGreaterThanOrEqual(0);
    expect(beforeIdx).toBeLessThan(resultIdx);

    // The commit checkpoint holds the result and the consumed approval id together.
    const cp2 = await checkpoints.getLatestCheckpoint(missionId);
    expect(cp2?.committedToolResults[toolCallId]).toBeDefined();
    expect(cp2?.consumedApprovalIds).toContain(approvalId);

    // 4. Resume: committed result replayed by toolCallId, the tap tool is not re-executed.
    const replay = await gate.execute(request(run, cp2!.committedToolResults));
    expect(replay.replayed).toBe(true);
    expect(run).toHaveBeenCalledTimes(1);

    // 5. A consumed approval can never be spent again, even without a committed result.
    await expect(gate.execute(request(run, {}))).rejects.toThrow(/will not re-execute/);
    expect(run).toHaveBeenCalledTimes(1);

    // 6. A different tool call cannot reuse the consumed approval: it needs its own.
    await expect(
      gate.execute({ ...request(run), input: { text: 'Another post' }, toolCallId: 'tc_publish_2' }),
    ).rejects.toThrow(TapApprovalRequiredError);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('a rejected approval blocks the tap tool', async () => {
    const callId = 'tc_publish_rejected';
    const id = tapApprovalId(missionId, 'N4', callId);
    const run = vi.fn();
    await expect(gate.execute({ ...request(run), toolCallId: callId })).rejects.toThrow(
      /pending/,
    );
    await approvals.decideApproval(id, 'rejected', 'Eng. Hazem Elerefy');
    await expect(gate.execute({ ...request(run), toolCallId: callId })).rejects.toThrow(
      /was rejected/,
    );
    expect(run).not.toHaveBeenCalled();
  });

  it('fails closed when no checkpoint snapshot provider is given for a tap tool', async () => {
    const run = vi.fn();
    await expect(
      gate.execute({ ...request(run), getSnapshot: undefined, toolCallId: 'tc_no_snapshot' }),
    ).rejects.toThrow(/cannot run without a checkpoint snapshot provider/);
    expect(run).not.toHaveBeenCalled();
  });

  it('explicitly granted ads_spend is still a tap tool that needs a consumed approval', async () => {
    const run = vi.fn();
    await expect(
      gate.execute({
        allowedToolIds: ['ads____createAdsSpend'],
        committedToolResults: {},
        getSnapshot: () => snapshot(missionId),
        grants: { adsSpend: true },
        input: { budget: 5 },
        missionId,
        nodeId: 'N4',
        run,
        toolCallId: 'tc_ads_granted',
        toolId: 'ads____createAdsSpend',
      }),
    ).rejects.toThrow(TapApprovalRequiredError);
    expect(run).not.toHaveBeenCalled();
  });
});

describe('recorded-path reconciliation against DB consumed rows', () => {
  const stubContext = {
    executeNode: async (nodeId: string) =>
      nodeId === 'N6'
        ? {
            approvalPayload: { draft: 'x', nodeId },
            output: { draft: 'x', nodeId },
            requiresApproval: true,
            status: 'paused' as const,
          }
        : { output: { nodeId }, status: 'completed' as const },
  };

  it('runMission and decideAndConsumeApproval reconcile the checkpoint with mission_approvals', async () => {
    const engine = new MissionEngine(model);
    const missionId = 'msn_reconcile_ok';
    await engine.createMission({ ...MARKETING_MISSION_DAG, id: missionId });

    const paused = await engine.runMission(missionId, stubContext, { concurrencyCap: 2 });
    expect(paused.status).toBe('paused');
    expect(paused.consumedApprovalIds).toEqual([]);

    const step = await engine.decideAndConsumeApproval({
      approvalId: paused.pausedApprovalId!,
      decidedBy: 'Eng. Hazem Elerefy',
      decision: 'approved',
      missionId,
    });
    expect(step.disposition).toBe('resumed');
    // DB consumed rows == checkpoint-recorded ids.
    expect(await engine.reconcileConsumedApprovals(missionId)).toEqual([paused.pausedApprovalId]);

    const done = await engine.runMission(missionId, stubContext, { concurrencyCap: 2 });
    expect(done.status).toBe('completed');
    expect(done.consumedApprovalIds).toEqual([paused.pausedApprovalId]);
  });

  it('decideAndConsumeApproval throws when a consumed DB row is missing from the recorded path', async () => {
    const engine = new MissionEngine(model);
    const missionId = 'msn_reconcile_rogue';
    await engine.createMission({ ...MARKETING_MISSION_DAG, id: missionId });
    const paused = await engine.runMission(missionId, stubContext, { concurrencyCap: 2 });

    // A consumption that bypassed the engine: consumed_at set in the DB, never recorded.
    const rogue = 'approval_rogue';
    await model.createApproval({
      id: rogue,
      missionId,
      nodeId: 'N9',
      shownPayload: JSON.stringify({ rogue: true }),
      shownPayloadHash: MissionApprovalManager.hashPayload({ rogue: true }),
    });
    await model.decideApproval(rogue, 'approved', 'rogue');
    await model.consumeApproval(rogue);

    await expect(
      engine.decideAndConsumeApproval({
        approvalId: paused.pausedApprovalId!,
        decidedBy: 'Eng. Hazem Elerefy',
        decision: 'approved',
        missionId,
      }),
    ).rejects.toThrow(/Recorded-path reconciliation failure.*approval_rogue/);
  });

  it('runMission throws when a consumed DB row is missing from the recorded path', async () => {
    const engine = new MissionEngine(model);
    const missionId = 'msn_reconcile_run';
    await engine.createMission({ ...MARKETING_MISSION_DAG, id: missionId });
    await model.createApproval({
      id: 'approval_rogue_run',
      missionId,
      nodeId: 'N9',
      shownPayload: JSON.stringify({ rogue: 2 }),
      shownPayloadHash: MissionApprovalManager.hashPayload({ rogue: 2 }),
    });
    await model.decideApproval('approval_rogue_run', 'approved', 'rogue');
    await model.consumeApproval('approval_rogue_run');
    // The engine's own pause checkpoint records no consumption, the DB has one.
    await expect(engine.runMission(missionId, stubContext, { concurrencyCap: 2 })).rejects.toThrow(
      /Recorded-path reconciliation failure/,
    );
  });
});
