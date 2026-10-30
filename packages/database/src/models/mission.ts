import { createHash } from 'node:crypto';

import { and, desc, eq, isNull } from 'drizzle-orm';

import type {
  AzzarAgentInstallItem,
  AzzarDepartmentItem,
  AzzarProjectItem,
  MissionApprovalItem,
  MissionCheckpointItem,
  MissionItem,
  MissionJournalItem,
  MissionNodeItem,
  MissionReceiptItem,
  NewAzzarAgentInstall,
  NewAzzarDepartment,
  NewAzzarProject,
  NewMission,
  NewMissionApproval,
  NewMissionCheckpoint,
  NewMissionJournal,
  NewMissionNode,
  NewMissionReceipt,
} from '../schemas/mission';
import {
  azzarAgentInstalls,
  azzarDepartments,
  azzarProjects,
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

  constructor(db?: AzzarChatDatabase) {
    this.db = db!;
  }

  // ── Mission CRUD ──────────────────────────────────────────

  async create(data: NewMission): Promise<MissionItem> {
    const result = await this.db.insert(missions).values(data).returning();
    return result[0];
  }

  async createMission(data: NewMission): Promise<MissionItem> {
    return this.create(data);
  }

  async findById(id: string): Promise<MissionItem | null> {
    const item = await this.db.query.missions.findFirst({
      where: eq(missions.id, id),
    });
    return item ?? null;
  }

  async getMission(id: string): Promise<MissionItem | null> {
    return this.findById(id);
  }

  async listMissions(limit = 50): Promise<MissionItem[]> {
    return this.db.select().from(missions).orderBy(desc(missions.createdAt)).limit(limit);
  }

  async updateStatus(id: string, status: string): Promise<MissionItem | null> {
    const result = await this.db
      .update(missions)
      .set({ status, updatedAt: new Date() })
      .where(eq(missions.id, id))
      .returning();
    return result[0] ?? null;
  }

  async updateMission(id: string, patch: { status: string }): Promise<MissionItem | null> {
    return this.updateStatus(id, patch.status);
  }

  // ── Nodes ────────────────────────────────────────────────

  async createNodes(nodesData: NewMissionNode[]): Promise<MissionNodeItem[]> {
    if (nodesData.length === 0) return [];
    return this.db.insert(missionNodes).values(nodesData).returning();
  }

  async createNode(nodeData: NewMissionNode): Promise<MissionNodeItem> {
    const rows = await this.createNodes([nodeData]);
    return rows[0];
  }

  async findNodesByMissionId(missionId: string): Promise<MissionNodeItem[]> {
    return this.db.select().from(missionNodes).where(eq(missionNodes.missionId, missionId));
  }

  async getNodes(missionId: string): Promise<MissionNodeItem[]> {
    return this.findNodesByMissionId(missionId);
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

  async updateNode(
    missionId: string,
    nodeId: string,
    patch: { status: string },
  ): Promise<MissionNodeItem | null> {
    return this.updateNodeStatus(missionId, nodeId, patch.status);
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

  async getApproval(id: string): Promise<MissionApprovalItem | null> {
    return this.findApprovalById(id);
  }

  async getApprovals(missionId: string): Promise<MissionApprovalItem[]> {
    return this.db
      .select()
      .from(missionApprovals)
      .where(eq(missionApprovals.missionId, missionId))
      .orderBy(missionApprovals.createdAt);
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

  private static hashShownPayload(shownPayload: unknown): string {
    const serialized =
      typeof shownPayload === 'string' ? shownPayload : JSON.stringify(shownPayload);
    return createHash('sha256').update(serialized).digest('hex');
  }

  async decideApproval(
    id: string,
    decision: 'approved' | 'rejected',
    decidedBy?: string,
  ): Promise<MissionApprovalItem | null> {
    const existing = await this.findApprovalById(id);
    if (!existing) {
      throw new Error(`Approval ${id} not found.`);
    }
    const recomputedHash = MissionModel.hashShownPayload(existing.shownPayload);
    if (recomputedHash !== existing.shownPayloadHash) {
      throw new Error(
        `Approval ${id} payload hash integrity check failed: stored ${existing.shownPayloadHash} != recomputed ${recomputedHash}`,
      );
    }

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
   * Throws if approval is not found, not approved, payload hash tampered, or already consumed.
   */
  async consumeApproval(id: string): Promise<MissionApprovalItem> {
    const existing = await this.findApprovalById(id);
    if (!existing) {
      throw new Error(`Approval ${id} not found.`);
    }
    const recomputedHash = MissionModel.hashShownPayload(existing.shownPayload);
    if (recomputedHash !== existing.shownPayloadHash) {
      throw new Error(
        `Approval ${id} payload hash integrity check failed: stored ${existing.shownPayloadHash} != recomputed ${recomputedHash}`,
      );
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

  async saveCheckpoint(data: NewMissionCheckpoint): Promise<MissionCheckpointItem> {
    return this.createCheckpoint(data);
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

  async saveReceipt(data: NewMissionReceipt): Promise<MissionReceiptItem> {
    const existing = await this.getReceipt(data.missionId);
    if (existing) {
      const updated = await this.db
        .update(missionReceipts)
        .set({ receiptJson: data.receiptJson })
        .where(eq(missionReceipts.missionId, data.missionId))
        .returning();
      return updated[0];
    }
    return this.createReceipt(data);
  }

  async getReceipt(missionId: string): Promise<MissionReceiptItem | null> {
    const item = await this.db.query.missionReceipts.findFirst({
      where: eq(missionReceipts.missionId, missionId),
    });
    return item ?? null;
  }

  // ── Phase 2: Departments (PostgreSQL) ────────────────────

  async upsertDepartment(data: NewAzzarDepartment): Promise<AzzarDepartmentItem> {
    const existing = await this.getDepartment(data.templateId);
    if (existing) {
      const updated = await this.db
        .update(azzarDepartments)
        .set({
          active: data.active ?? existing.active,
          context: data.context ?? existing.context,
          customNameJson:
            data.customNameJson !== undefined ? data.customNameJson : existing.customNameJson,
          instructions: data.instructions ?? existing.instructions,
          rulesJson: data.rulesJson ?? existing.rulesJson,
          sourcesJson: data.sourcesJson ?? existing.sourcesJson,
          tone: data.tone ?? existing.tone,
          updatedAt: new Date(),
        })
        .where(eq(azzarDepartments.templateId, data.templateId))
        .returning();
      return updated[0];
    }
    const inserted = await this.db.insert(azzarDepartments).values(data).returning();
    return inserted[0];
  }

  async getDepartment(templateId: string): Promise<AzzarDepartmentItem | null> {
    const rows = await this.db
      .select()
      .from(azzarDepartments)
      .where(eq(azzarDepartments.templateId, templateId))
      .limit(1);
    return rows[0] ?? null;
  }

  async listDepartments(): Promise<AzzarDepartmentItem[]> {
    return this.db.select().from(azzarDepartments).orderBy(azzarDepartments.activatedAt);
  }

  async deactivateDepartment(templateId: string): Promise<AzzarDepartmentItem | null> {
    const existing = await this.getDepartment(templateId);
    if (!existing) return null;
    const updated = await this.db
      .update(azzarDepartments)
      .set({ active: false, updatedAt: new Date() })
      .where(eq(azzarDepartments.templateId, templateId))
      .returning();
    return updated[0] ?? null;
  }

  // ── Phase 2: Projects (PostgreSQL) ───────────────────────

  async createProject(data: NewAzzarProject): Promise<AzzarProjectItem> {
    const inserted = await this.db.insert(azzarProjects).values(data).returning();
    return inserted[0];
  }

  async updateProject(
    id: string,
    patch: Partial<
      Pick<
        NewAzzarProject,
        | 'context'
        | 'departmentId'
        | 'description'
        | 'inheritJson'
        | 'name'
        | 'sourcesJson'
        | 'visibility'
      >
    >,
  ): Promise<AzzarProjectItem | null> {
    const updated = await this.db
      .update(azzarProjects)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(azzarProjects.id, id))
      .returning();
    return updated[0] ?? null;
  }

  async getProject(id: string): Promise<AzzarProjectItem | null> {
    const rows = await this.db
      .select()
      .from(azzarProjects)
      .where(eq(azzarProjects.id, id))
      .limit(1);
    return rows[0] ?? null;
  }

  async listProjects(departmentId?: string): Promise<AzzarProjectItem[]> {
    if (departmentId) {
      return this.db
        .select()
        .from(azzarProjects)
        .where(eq(azzarProjects.departmentId, departmentId))
        .orderBy(desc(azzarProjects.createdAt));
    }
    return this.db.select().from(azzarProjects).orderBy(desc(azzarProjects.createdAt));
  }

  async deleteProject(id: string): Promise<void> {
    await this.db.delete(azzarProjects).where(eq(azzarProjects.id, id));
  }

  // ── Phase 2: Agent Installs / My Agents (PostgreSQL) ─────

  async installAgent(data: NewAzzarAgentInstall): Promise<AzzarAgentInstallItem> {
    const existing = await this.getAgentInstall(data.templateId);
    if (existing) {
      const deptIds = Array.from(
        new Set([
          ...((existing.departmentIdsJson as string[]) || []),
          ...((data.departmentIdsJson as string[]) || []),
        ]),
      );
      const projIds = Array.from(
        new Set([
          ...((existing.projectIdsJson as string[]) || []),
          ...((data.projectIdsJson as string[]) || []),
        ]),
      );
      const updated = await this.db
        .update(azzarAgentInstalls)
        .set({
          departmentIdsJson: deptIds,
          projectIdsJson: projIds,
          status: data.status ?? existing.status,
          updatedAt: new Date(),
        })
        .where(eq(azzarAgentInstalls.templateId, data.templateId))
        .returning();
      return updated[0];
    }
    const inserted = await this.db.insert(azzarAgentInstalls).values(data).returning();
    return inserted[0];
  }

  async assignAgent(
    templateId: string,
    target: { departmentId?: string; projectId?: string },
  ): Promise<AzzarAgentInstallItem> {
    const existing = await this.getAgentInstall(templateId);
    if (!existing) {
      throw new Error(`Agent ${templateId} is not installed in My Agents.`);
    }
    const deptIds = Array.from(
      new Set([
        ...((existing.departmentIdsJson as string[]) || []),
        ...(target.departmentId ? [target.departmentId] : []),
      ]),
    );
    const projIds = Array.from(
      new Set([
        ...((existing.projectIdsJson as string[]) || []),
        ...(target.projectId ? [target.projectId] : []),
      ]),
    );
    const updated = await this.db
      .update(azzarAgentInstalls)
      .set({
        departmentIdsJson: deptIds,
        projectIdsJson: projIds,
        updatedAt: new Date(),
      })
      .where(eq(azzarAgentInstalls.templateId, templateId))
      .returning();
    return updated[0];
  }

  async unassignAgent(
    templateId: string,
    target: { departmentId?: string; projectId?: string },
  ): Promise<AzzarAgentInstallItem | null> {
    const existing = await this.getAgentInstall(templateId);
    if (!existing) return null;
    const deptIds = ((existing.departmentIdsJson as string[]) || []).filter(
      (id) => id !== target.departmentId,
    );
    const projIds = ((existing.projectIdsJson as string[]) || []).filter(
      (id) => id !== target.projectId,
    );
    const updated = await this.db
      .update(azzarAgentInstalls)
      .set({
        departmentIdsJson: deptIds,
        projectIdsJson: projIds,
        updatedAt: new Date(),
      })
      .where(eq(azzarAgentInstalls.templateId, templateId))
      .returning();
    return updated[0] ?? null;
  }

  async uninstallAgent(templateId: string): Promise<boolean> {
    const deleted = await this.db
      .delete(azzarAgentInstalls)
      .where(eq(azzarAgentInstalls.templateId, templateId))
      .returning();
    return deleted.length > 0;
  }

  async getAgentInstall(templateId: string): Promise<AzzarAgentInstallItem | null> {
    const rows = await this.db
      .select()
      .from(azzarAgentInstalls)
      .where(eq(azzarAgentInstalls.templateId, templateId))
      .limit(1);
    return rows[0] ?? null;
  }

  async listAgentInstalls(): Promise<AzzarAgentInstallItem[]> {
    return this.db.select().from(azzarAgentInstalls).orderBy(azzarAgentInstalls.installedAt);
  }
}
