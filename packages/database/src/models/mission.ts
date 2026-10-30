import { and, desc, eq, isNull } from 'drizzle-orm';

import type {
  MissionApprovalItem,
  MissionCheckpointItem,
  MissionItem,
  MissionJournalItem,
  MissionNodeItem,
  MissionReceiptItem,
  NewMission,
  NewMissionApproval,
  NewMissionCheckpoint,
  NewMissionJournal,
  NewMissionNode,
  NewMissionReceipt,
} from '../schemas/mission';
import {
  missionApprovals,
  missionCheckpoints,
  missionJournal,
  missionNodes,
  missionReceipts,
  missions,
} from '../schemas/mission';
import type { AzzarChatDatabase } from '../type';

export class MissionModel {
  private readonly db: AzzarChatDatabase;

  constructor(db: AzzarChatDatabase) {
    this.db = db;
  }

  // ── Mission CRUD ──────────────────────────────────────────

  async create(data: NewMission): Promise<MissionItem> {
    const result = await this.db.insert(missions).values(data).returning();
    return result[0];
  }

  async findById(id: string): Promise<MissionItem | null> {
    const item = await this.db.query.missions.findFirst({
      where: eq(missions.id, id),
    });
    return item ?? null;
  }

  async updateStatus(id: string, status: string): Promise<MissionItem | null> {
    const result = await this.db
      .update(missions)
      .set({ status, updatedAt: new Date() })
      .where(eq(missions.id, id))
      .returning();
    return result[0] ?? null;
  }

  // ── Nodes ────────────────────────────────────────────────

  async createNodes(nodesData: NewMissionNode[]): Promise<MissionNodeItem[]> {
    if (nodesData.length === 0) return [];
    return this.db.insert(missionNodes).values(nodesData).returning();
  }

  async findNodesByMissionId(missionId: string): Promise<MissionNodeItem[]> {
    return this.db.select().from(missionNodes).where(eq(missionNodes.missionId, missionId));
  }

  async findNode(missionId: string, nodeId: string): Promise<MissionNodeItem | null> {
    const item = await this.db.query.missionNodes.findFirst({
      where: and(eq(missionNodes.missionId, missionId), eq(missionNodes.nodeId, nodeId)),
    });
    return item ?? null;
  }

  async updateNodeStatus(
    missionId: string,
    nodeId: string,
    status: string,
  ): Promise<MissionNodeItem | null> {
    const result = await this.db
      .update(missionNodes)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(missionNodes.missionId, missionId), eq(missionNodes.nodeId, nodeId)))
      .returning();
    return result[0] ?? null;
  }

  // ── Approvals ────────────────────────────────────────────

  async createApproval(data: NewMissionApproval): Promise<MissionApprovalItem> {
    const result = await this.db.insert(missionApprovals).values(data).returning();
    return result[0];
  }

  async findApprovalById(id: string): Promise<MissionApprovalItem | null> {
    const item = await this.db.query.missionApprovals.findFirst({
      where: eq(missionApprovals.id, id),
    });
    return item ?? null;
  }

  async findApprovalByHash(missionId: string, hash: string): Promise<MissionApprovalItem | null> {
    const item = await this.db.query.missionApprovals.findFirst({
      where: and(
        eq(missionApprovals.missionId, missionId),
        eq(missionApprovals.shownPayloadHash, hash),
      ),
    });
    return item ?? null;
  }

  async decideApproval(
    id: string,
    decision: 'approved' | 'rejected',
    decidedBy?: string,
  ): Promise<MissionApprovalItem | null> {
    const result = await this.db
      .update(missionApprovals)
      .set({
        decidedAt: new Date(),
        decidedBy: decidedBy ?? null,
        decision,
        updatedAt: new Date(),
      })
      .where(eq(missionApprovals.id, id))
      .returning();
    return result[0] ?? null;
  }

  /**
   * Consume an approval transactionally.
   * Throws if approval is not found, not approved, or already consumed.
   */
  async consumeApproval(id: string): Promise<MissionApprovalItem> {
    const existing = await this.findApprovalById(id);
    if (!existing) {
      throw new Error(`Approval ${id} not found.`);
    }
    if (existing.consumedAt) {
      throw new Error(
        `Approval ${id} has already been consumed at ${existing.consumedAt.toISOString()}.`,
      );
    }
    if (existing.decision !== 'approved') {
      throw new Error(
        `Cannot consume approval ${id} with decision "${existing.decision}". Must be approved.`,
      );
    }

    const result = await this.db
      .update(missionApprovals)
      .set({
        consumedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(missionApprovals.id, id), isNull(missionApprovals.consumedAt)))
      .returning();

    if (result.length === 0) {
      throw new Error(`Concurrent consumption detected for approval ${id}.`);
    }

    return result[0];
  }

  // ── Checkpoints ──────────────────────────────────────────

  async createCheckpoint(data: NewMissionCheckpoint): Promise<MissionCheckpointItem> {
    const result = await this.db.insert(missionCheckpoints).values(data).returning();
    return result[0];
  }

  async getLatestCheckpoint(missionId: string): Promise<MissionCheckpointItem | null> {
    const items = await this.db
      .select()
      .from(missionCheckpoints)
      .where(eq(missionCheckpoints.missionId, missionId))
      .orderBy(desc(missionCheckpoints.createdAt))
      .limit(1);
    return items[0] ?? null;
  }

  // ── Journal ──────────────────────────────────────────────

  async appendJournal(data: NewMissionJournal): Promise<MissionJournalItem> {
    const result = await this.db.insert(missionJournal).values(data).returning();
    return result[0];
  }

  async getJournal(missionId: string): Promise<MissionJournalItem[]> {
    return this.db
      .select()
      .from(missionJournal)
      .where(eq(missionJournal.missionId, missionId))
      .orderBy(missionJournal.createdAt);
  }

  // ── Receipts ─────────────────────────────────────────────

  async createReceipt(data: NewMissionReceipt): Promise<MissionReceiptItem> {
    const result = await this.db.insert(missionReceipts).values(data).returning();
    return result[0];
  }

  async getReceipt(missionId: string): Promise<MissionReceiptItem | null> {
    const item = await this.db.query.missionReceipts.findFirst({
      where: eq(missionReceipts.missionId, missionId),
    });
    return item ?? null;
  }
}
