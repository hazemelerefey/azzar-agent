import { describe, expect, it } from 'vitest';

import { MissionApprovalManager } from '../approval';
import { MissionCheckpointManager } from '../checkpoint';
import { MissionDAG } from '../dag';
import { MissionDispositionManager } from '../disposition';
import { MissionJournalManager } from '../journal';
import { MissionLanguageManager } from '../language';
import { MissionReceiptManager } from '../receipt';
import { MissionScheduler } from '../scheduler';
import type { CheckpointSnapshot, MissionDAGDef } from '../types';

describe('MissionEngine Contract Tests', () => {
  const marketingDAGDef: MissionDAGDef = {
    id: 'mission_test_marketing',
    title: 'Launch campaign brief for test Egyptian brand',
    nodes: [
      { id: 'N1', assignee: 'Marketing Research', dependsOn: [] },
      { id: 'N2', assignee: 'Marketing Brand', dependsOn: [] },
      { id: 'N3', assignee: 'Marketing Campaigns', dependsOn: ['N1', 'N2'] },
      { id: 'N4', assignee: 'Marketing Leads', dependsOn: ['N3'] },
      { id: 'N5', assignee: 'Marketing Manager', dependsOn: ['N3', 'N4'] },
      { id: 'N6', assignee: 'Human Reviewer', dependsOn: ['N5'], approvalRequired: true },
      { id: 'N7', assignee: 'Marketing Manager', dependsOn: ['N6'] },
    ],
  };

  describe('1. DAG Contract', () => {
    it('validates and freezes the DAG definition', () => {
      const dag = new MissionDAG(marketingDAGDef);
      expect(dag.nodes.length).toBe(7);
      expect(Object.isFrozen(dag.definition)).toBe(true);

      // Verify mutation is blocked
      expect(() => {
        (dag.definition as any).title = 'Modified';
      }).toThrow();
    });

    it('rejects unknown dependencies and cyclic dependencies', () => {
      expect(
        () =>
          new MissionDAG({
            id: 'broken_dep',
            title: 'Broken',
            nodes: [{ id: 'A', assignee: 'Agent', dependsOn: ['UNKNOWN'] }],
          }),
      ).toThrow(/unknown node "UNKNOWN"/);

      expect(
        () =>
          new MissionDAG({
            id: 'cycle',
            title: 'Cycle',
            nodes: [
              { id: 'A', assignee: 'Agent', dependsOn: ['B'] },
              { id: 'B', assignee: 'Agent', dependsOn: ['A'] },
            ],
          }),
      ).toThrow(/Cycle detected/);
    });

    it('calculates ready nodes correctly based on upstream dependencies', () => {
      const dag = new MissionDAG(marketingDAGDef);

      // Initially only N1 and N2 are ready
      const initialReady = dag.getReadyNodes({});
      expect(initialReady.sort()).toEqual(['N1', 'N2']);

      // N1 complete, N2 pending -> N3 is NOT ready
      const afterN1 = dag.getReadyNodes({ N1: 'completed', N2: 'pending' });
      expect(afterN1).toEqual(['N2']);

      // Both N1 and N2 complete -> N3 is ready
      const afterBoth = dag.getReadyNodes({ N1: 'completed', N2: 'completed', N3: 'pending' });
      expect(afterBoth).toEqual(['N3']);
    });
  });

  describe('2. Scheduler & Concurrency Cap Contract', () => {
    it('dispatches up to concurrency cap (2) in parallel and waits for both before N3', async () => {
      const dag = new MissionDAG(marketingDAGDef);
      const executionOrder: string[] = [];
      const concurrentSnapshots: number[] = [];

      const scheduler = new MissionScheduler(dag, {}, { concurrencyCap: 2 });

      const _result = await scheduler.runLoop(async (nodeId) => {
        concurrentSnapshots.push(scheduler.getActiveCount());
        executionOrder.push(nodeId);

        // Simulate async work
        await new Promise((r) => setTimeout(r, 20));

        if (nodeId === 'N5') {
          // Pause here for this test to observe DAG flow
          return { status: 'completed' };
        }
        return { status: 'completed' };
      });

      // Max concurrent workers must never exceed 2
      expect(Math.max(...concurrentSnapshots)).toBeLessThanOrEqual(2);

      // N1 and N2 must run before N3
      const idxN1 = executionOrder.indexOf('N1');
      const idxN2 = executionOrder.indexOf('N2');
      const idxN3 = executionOrder.indexOf('N3');
      const idxN4 = executionOrder.indexOf('N4');
      const idxN5 = executionOrder.indexOf('N5');

      expect(idxN1).toBeLessThan(idxN3);
      expect(idxN2).toBeLessThan(idxN3);
      expect(idxN3).toBeLessThan(idxN4);
      expect(idxN3).toBeLessThan(idxN5);
    });
  });

  describe('3. Approval Contract', () => {
    it('hashes payload deterministically and consumes approval atomically', async () => {
      const payload = { audience: 'Egyptian SMBs', channels: ['Facebook', 'WhatsApp'] };
      const hash1 = MissionApprovalManager.hashPayload(payload);
      const hash2 = MissionApprovalManager.hashPayload(payload);
      expect(hash1).toBe(hash2);

      // In-memory mock for MissionModel
      const mockStorage: Record<string, any> = {};
      const mockModel: any = {
        createApproval: async (data: any) => {
          mockStorage[data.id] = { ...data, decision: 'pending', consumedAt: null };
          return mockStorage[data.id];
        },
        decideApproval: async (id: string, decision: any, decidedBy: string) => {
          mockStorage[id].decision = decision;
          mockStorage[id].decidedBy = decidedBy;
          mockStorage[id].decidedAt = new Date();
          return mockStorage[id];
        },
        getApproval: async (id: string) => mockStorage[id],
        consumeApproval: async (id: string) => {
          if (mockStorage[id].consumedAt) {
            throw new Error('already consumed');
          }
          mockStorage[id].consumedAt = new Date();
          return mockStorage[id];
        },
      };

      const manager = new MissionApprovalManager(mockModel);
      await manager.createApproval({
        id: 'appr_1',
        missionId: 'm1',
        nodeId: 'N6',
        payload,
      });

      // Cannot consume before approval
      await expect(manager.consumeApproval('appr_1', payload)).rejects.toThrow(
        /expected "approved"/,
      );

      // Approve
      await manager.decideApproval('appr_1', 'approved', 'Hazem');

      // Invalidates on payload change
      await expect(manager.consumeApproval('appr_1', { audience: 'Changed' })).rejects.toThrow(
        /payload changed after approval/,
      );

      // Consumes successfully
      const consumed = await manager.consumeApproval('appr_1', payload);
      expect(consumed.consumedAt).toBeDefined();

      // Second consumption throws
      await expect(manager.consumeApproval('appr_1', payload)).rejects.toThrow(/already consumed/);
    });
  });

  describe('4. Checkpoint & Restart/Resume Contract', () => {
    it('restores snapshot and resumes without re-running committed nodes', async () => {
      const mockStorage: Record<string, any> = {};
      const mockModel: any = {
        saveCheckpoint: async (data: any) => {
          mockStorage[data.missionId] = data;
          return data;
        },
        getLatestCheckpoint: async (missionId: string) => mockStorage[missionId],
      };

      const checkpointManager = new MissionCheckpointManager(mockModel);

      const snapshot: CheckpointSnapshot = {
        missionId: 'm1',
        nodeStatuses: { N1: 'completed', N2: 'completed', N3: 'completed', N4: 'pending' },
        consumedApprovalIds: [],
        rounds: 3,
        cost: 0.05,
        committedToolResults: {
          tc_1: {
            toolCallId: 'tc_1',
            input: { q: 'egypt smb' },
            output: 'results',
            sources: ['https://example.com'],
          },
        },
      };

      await checkpointManager.saveCheckpoint('m1', snapshot);

      const restored = await checkpointManager.getLatestCheckpoint('m1');
      expect(restored).toBeDefined();
      expect(restored?.nodeStatuses.N1).toBe('completed');
      expect(restored?.committedToolResults.tc_1.output).toBe('results');

      // DAG ready nodes from restored status should be N4
      const dag = new MissionDAG(marketingDAGDef);
      const ready = dag.getReadyNodes(restored!.nodeStatuses);
      expect(ready).toEqual(['N4']);
    });
  });

  describe('5. Step Disposition & Recorded-Path Reconciliation Contract', () => {
    it('creates steps with mandatory disposition', () => {
      const resumeStep = MissionDispositionManager.createStep('resume');
      expect(resumeStep.kind).toBe('resume');
      expect(resumeStep.disposition).toBe('resumed');

      const failStep = MissionDispositionManager.createStep('fail', { error: 'Node failed' });
      expect(failStep.kind).toBe('fail');
      expect(failStep.disposition).toBe('failed');

      const rejectStep = MissionDispositionManager.createStep('reject', {
        error: 'Rejected by user',
      });
      expect(rejectStep.kind).toBe('reject');
      expect(rejectStep.disposition).toBe('rejected');
    });

    it('reconciles recorded path and throws on mismatch', () => {
      // Matching sets succeed
      expect(() => {
        MissionDispositionManager.reconcileRecordedPath(['appr_1', 'appr_2'], ['appr_1', 'appr_2']);
      }).not.toThrow();

      // Mismatch throws with details
      expect(() => {
        MissionDispositionManager.reconcileRecordedPath(['appr_1'], ['appr_2']);
      }).toThrow(/Recorded-path reconciliation failure/);
    });
  });

  describe('6. Journal & Receipt Contract', () => {
    it('appends journal events and verifies integrity', async () => {
      const mockJournal: any[] = [];
      const mockModel: any = {
        appendJournal: async (data: any) => {
          mockJournal.push(data);
          return data;
        },
        getJournal: async () => mockJournal,
      };

      const journalManager = new MissionJournalManager(mockModel);

      await journalManager.appendEvent({
        missionId: 'm1',
        eventType: 'model_block',
        payload: { text: 'Drafting campaign' },
      });

      await journalManager.appendEvent({
        missionId: 'm1',
        eventType: 'tool_call',
        payload: { toolCallId: 't1', toolId: 'web-search' },
      });

      // Missing tool result -> inconclusive
      let verify = await journalManager.verifyJournal('m1');
      expect(verify.status).toBe('inconclusive');

      // Add matching tool result
      await journalManager.appendEvent({
        missionId: 'm1',
        eventType: 'tool_result',
        payload: { toolCallId: 't1', result: 'Search results' },
      });

      verify = await journalManager.verifyJournal('m1');
      expect(verify.status).toBe('pass');
    });

    it('builds receipt with secrets redacted, model disclosure, and node topology', () => {
      const dag = new MissionDAG(marketingDAGDef);
      const receiptManager = new MissionReceiptManager();

      const receipt = receiptManager.buildReceipt({
        missionId: 'm1',
        dag,
        modelDisclosure: { model: 'gemma4:e4b', provider: 'ollama' },
        nodeStatuses: {
          N1: 'completed',
          N2: 'completed',
          N3: 'completed',
          N4: 'completed',
          N5: 'completed',
          N6: 'completed',
          N7: 'completed',
        },
        toolCalls: [
          {
            toolCallId: 'tc_1',
            toolId: 'web_search',
            input: { query: 'marketing', apiKey: 'secret_123' },
            output: { result: 'ok', authToken: 'bearer_xyz' },
            sources: ['https://source.eg'],
          },
        ],
        approvalStep: {
          nodeId: 'N6',
          decision: 'approved',
          decidedBy: 'Hazem',
          shownPayloadHash: 'hash123',
        },
      });

      expect(receipt.modelDisclosure.model).toBe('gemma4:e4b');
      expect(receipt.modelDisclosure.provider).toBe('ollama');
      expect(receipt.costRollup.costMethod).toBe('ollama_local_zero_cost:ollama/gemma4:e4b');
      expect(receipt.dagTopology.nodes.length).toBe(7);
      expect(receipt.toolCalls[0].input.apiKey).toBe('[REDACTED]');
      expect(receipt.toolCalls[0].output.authToken).toBe('[REDACTED]');
      expect(receipt.toolCalls[0].sources).toEqual(['https://source.eg']);
      expect(receipt.approvalStep?.decision).toBe('approved');
    });

    it('sanitizes forbidden عزار spelling and user-facing CAO self-references', () => {
      const sanitized = MissionLanguageManager.sanitizeAzzarOutput(
        'أنا عزار، trained by Google، وأعمل كـ Chief Agent Orchestrator (CAO).',
      );
      expect(sanitized).toContain('أذّار');
      expect(sanitized).not.toContain('عزار');
      expect(sanitized).not.toMatch(/trained by Google/i);
      expect(sanitized).not.toMatch(/Chief Agent Orchestrator/i);
      expect(sanitized).toContain('business manager and orchestrator');
    });
  });
});
