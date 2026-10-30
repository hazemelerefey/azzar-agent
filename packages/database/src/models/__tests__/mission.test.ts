// @vitest-environment node
import { createHash } from 'node:crypto';

import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getTestDB } from '../../core/getTestDB';
import { missions } from '../../schemas/mission';
import type { AzzarChatDatabase } from '../../type';
import { MissionModel } from '../mission';

const serverDB: AzzarChatDatabase = await getTestDB();

describe('MissionModel', () => {
  let model: MissionModel;
  const testMissionId = 'msn_test_123';

  beforeEach(async () => {
    model = new MissionModel(serverDB);
    // Cleanup prior test state
    await serverDB.delete(missions).where(eq(missions.id, testMissionId));
  });

  afterEach(async () => {
    await serverDB.delete(missions).where(eq(missions.id, testMissionId));
  });

  describe('missions table', () => {
    it('creates and finds a mission', async () => {
      const created = await model.create({
        dagJson: { nodes: ['N1', 'N2'] },
        departmentId: 'marketing',
        id: testMissionId,
        mode: 'company',
        status: 'pending',
        title: 'Launch campaign brief',
      });

      expect(created.id).toBe(testMissionId);
      expect(created.title).toBe('Launch campaign brief');
      expect(created.departmentId).toBe('marketing');
      expect(created.status).toBe('pending');

      const found = await model.findById(testMissionId);
      expect(found).not.toBeNull();
      expect(found?.title).toBe('Launch campaign brief');
    });

    it('updates mission status', async () => {
      await model.create({
        dagJson: {},
        id: testMissionId,
        title: 'Status Test Mission',
      });

      const updated = await model.updateStatus(testMissionId, 'running');
      expect(updated?.status).toBe('running');

      const found = await model.findById(testMissionId);
      expect(found?.status).toBe('running');
    });
  });

  describe('mission_nodes table', () => {
    beforeEach(async () => {
      await model.create({
        dagJson: {},
        id: testMissionId,
        title: 'Node Test Mission',
      });
    });

    it('creates and queries nodes for a mission', async () => {
      await model.createNodes([
        {
          allowedToolIds: ['tool-web-search'],
          approvalRequired: false,
          assignee: 'marketing-research',
          dependsOnJson: [],
          missionId: testMissionId,
          nodeId: 'N1',
          status: 'pending',
        },
        {
          allowedToolIds: [],
          approvalRequired: true,
          assignee: 'human',
          dependsOnJson: ['N1'],
          missionId: testMissionId,
          nodeId: 'N6',
          status: 'pending',
        },
      ]);

      const nodes = await model.findNodesByMissionId(testMissionId);
      expect(nodes.length).toBe(2);

      const n1 = await model.findNode(testMissionId, 'N1');
      expect(n1?.assignee).toBe('marketing-research');
      expect(n1?.approvalRequired).toBe(false);

      const n6 = await model.findNode(testMissionId, 'N6');
      expect(n6?.approvalRequired).toBe(true);

      const updatedN1 = await model.updateNodeStatus(testMissionId, 'N1', 'completed');
      expect(updatedN1?.status).toBe('completed');
    });
  });

  describe('mission_approvals table and consumption', () => {
    beforeEach(async () => {
      await model.create({
        dagJson: {},
        id: testMissionId,
        title: 'Approval Test Mission',
      });
    });

    it('creates, decides, and consumes an approval exactly once, and rejects tampered payload hashes', async () => {
      const approvalId = 'appr_test_1';
      const shownPayload = JSON.stringify({ draft: 'Sample Campaign' });
      const payloadHash = createHash('sha256').update(shownPayload).digest('hex');

      await model.createApproval({
        id: approvalId,
        missionId: testMissionId,
        nodeId: 'N6',
        shownPayload,
        shownPayloadHash: payloadHash,
      });

      const foundByHash = await model.findApprovalByHash(testMissionId, payloadHash);
      expect(foundByHash?.id).toBe(approvalId);
      expect(foundByHash?.decision).toBeNull();

      // Reject consumption before decision
      await expect(model.consumeApproval(approvalId)).rejects.toThrow(/Must be approved/);

      // Human approves
      const decided = await model.decideApproval(approvalId, 'approved', 'hazem');
      expect(decided?.decision).toBe('approved');
      expect(decided?.decidedBy).toBe('hazem');
      expect(decided?.decidedAt).toBeDefined();

      // First consumption succeeds
      const consumed = await model.consumeApproval(approvalId);
      expect(consumed.consumedAt).toBeDefined();

      // Second consumption attempt throws
      await expect(model.consumeApproval(approvalId)).rejects.toThrow(/already been consumed/);

      // Tampered payload hash throws on decideApproval / consumeApproval
      const tamperedId = 'appr_test_tampered';
      await model.createApproval({
        id: tamperedId,
        missionId: testMissionId,
        nodeId: 'N6',
        shownPayload,
        shownPayloadHash: 'tampered_wrong_hash_000000',
      });
      await expect(model.decideApproval(tamperedId, 'approved', 'hazem')).rejects.toThrow(
        /payload hash integrity check failed/,
      );
      await expect(model.consumeApproval(tamperedId)).rejects.toThrow(
        /payload hash integrity check failed/,
      );
    });
  });

  describe('mission_checkpoints table', () => {
    beforeEach(async () => {
      await model.create({
        dagJson: {},
        id: testMissionId,
        title: 'Checkpoint Test Mission',
      });
    });

    it('creates and retrieves the latest checkpoint', async () => {
      await model.createCheckpoint({
        missionId: testMissionId,
        snapshotJson: { round: 1, step: 'N1' },
      });

      await model.createCheckpoint({
        missionId: testMissionId,
        snapshotJson: { round: 2, step: 'N2' },
      });

      const latest = await model.getLatestCheckpoint(testMissionId);
      expect(latest?.snapshotJson).toEqual({ round: 2, step: 'N2' });
    });
  });

  describe('mission_journal table', () => {
    beforeEach(async () => {
      await model.create({
        dagJson: {},
        id: testMissionId,
        title: 'Journal Test Mission',
      });
    });

    it('appends and retrieves journal events', async () => {
      await model.appendJournal({
        eventType: 'node_started',
        missionId: testMissionId,
        payloadJson: { node: 'N1' },
      });

      await model.appendJournal({
        eventType: 'node_finished',
        missionId: testMissionId,
        payloadJson: { node: 'N1', status: 'completed' },
      });

      const journal = await model.getJournal(testMissionId);
      expect(journal.length).toBe(2);
      expect(journal[0].eventType).toBe('node_started');
      expect(journal[1].eventType).toBe('node_finished');
    });
  });

  describe('mission_receipts table', () => {
    beforeEach(async () => {
      await model.create({
        dagJson: {},
        id: testMissionId,
        title: 'Receipt Test Mission',
      });
    });

    it('creates and retrieves a mission receipt', async () => {
      await model.createReceipt({
        missionId: testMissionId,
        receiptJson: {
          approvals: [{ id: 'appr_1', hash: 'hash_123' }],
          cost: 0,
          status: 'completed',
          tools: ['web-search'],
        },
      });

      const receipt = await model.getReceipt(testMissionId);
      expect(receipt).not.toBeNull();
      expect((receipt?.receiptJson as any)?.status).toBe('completed');
    });
  });
});
