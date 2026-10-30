import { relations } from 'drizzle-orm';
import { boolean, index, jsonb, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { createdAt, timestamptz, updatedAt } from './_helpers';

// ── 1. Missions ──────────────────────────────────────────

export const missions = pgTable(
  'missions',
  {
    id: text('id').primaryKey().notNull(),
    title: text('title').notNull(),
    departmentId: text('department_id').notNull().default('marketing'),
    projectId: text('project_id'),
    mode: text('mode').notNull().default('company'),
    status: text('status').notNull().default('pending'),
    dagJson: jsonb('dag_json').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('missions_department_id_idx').on(t.departmentId),
    index('missions_project_id_idx').on(t.projectId),
    index('missions_status_idx').on(t.status),
  ],
);

// ── 2. Mission Nodes ─────────────────────────────────────

export const missionNodes = pgTable(
  'mission_nodes',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    missionId: text('mission_id')
      .references(() => missions.id, { onDelete: 'cascade' })
      .notNull(),
    nodeId: text('node_id').notNull(),
    assignee: text('assignee').notNull(),
    dependsOnJson: jsonb('depends_on_json').notNull().default([]),
    status: text('status').notNull().default('pending'),
    expectedOutputSchema: jsonb('expected_output_schema'),
    allowedToolIds: jsonb('allowed_tool_ids').notNull().default([]),
    approvalRequired: boolean('approval_required').notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('mission_nodes_mission_id_idx').on(t.missionId),
    uniqueIndex('mission_nodes_mission_id_node_id_unique').on(t.missionId, t.nodeId),
  ],
);

// ── 3. Mission Approvals ─────────────────────────────────

export const missionApprovals = pgTable(
  'mission_approvals',
  {
    id: text('id').primaryKey().notNull(), // approval_id
    missionId: text('mission_id')
      .references(() => missions.id, { onDelete: 'cascade' })
      .notNull(),
    nodeId: text('node_id').notNull(),
    toolId: text('tool_id'),
    shownPayload: text('shown_payload').notNull(),
    shownPayloadHash: text('shown_payload_hash').notNull(),
    decision: text('decision'),
    decidedBy: text('decided_by'),
    decidedAt: timestamptz('decided_at'),
    consumedAt: timestamptz('consumed_at'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('mission_approvals_mission_id_idx').on(t.missionId),
    index('mission_approvals_shown_payload_hash_idx').on(t.shownPayloadHash),
  ],
);

// ── 4. Mission Checkpoints ───────────────────────────────

export const missionCheckpoints = pgTable(
  'mission_checkpoints',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    missionId: text('mission_id')
      .references(() => missions.id, { onDelete: 'cascade' })
      .notNull(),
    snapshotJson: jsonb('snapshot_json').notNull(),
    createdAt: createdAt(),
  },
  (t) => [index('mission_checkpoints_mission_id_idx').on(t.missionId)],
);

// ── 5. Mission Journal ───────────────────────────────────

export const missionJournal = pgTable(
  'mission_journal',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    missionId: text('mission_id')
      .references(() => missions.id, { onDelete: 'cascade' })
      .notNull(),
    eventType: text('event_type').notNull(),
    payloadJson: jsonb('payload_json').notNull(),
    sourceEventId: text('source_event_id'),
    createdAt: createdAt(),
  },
  (t) => [
    index('mission_journal_mission_id_idx').on(t.missionId),
    index('mission_journal_event_type_idx').on(t.eventType),
  ],
);

// ── 6. Mission Receipts ──────────────────────────────────

export const missionReceipts = pgTable(
  'mission_receipts',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    missionId: text('mission_id')
      .references(() => missions.id, { onDelete: 'cascade' })
      .notNull(),
    receiptJson: jsonb('receipt_json').notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('mission_receipts_mission_id_unique').on(t.missionId)],
);

// ── Relations ────────────────────────────────────────────

export const missionsRelations = relations(missions, ({ many, one }) => ({
  approvals: many(missionApprovals),
  checkpoints: many(missionCheckpoints),
  journal: many(missionJournal),
  nodes: many(missionNodes),
  receipt: one(missionReceipts, {
    fields: [missions.id],
    references: [missionReceipts.missionId],
  }),
}));

export const missionNodesRelations = relations(missionNodes, ({ one }) => ({
  mission: one(missions, {
    fields: [missionNodes.missionId],
    references: [missions.id],
  }),
}));

export const missionApprovalsRelations = relations(missionApprovals, ({ one }) => ({
  mission: one(missions, {
    fields: [missionApprovals.missionId],
    references: [missions.id],
  }),
}));

export const missionCheckpointsRelations = relations(missionCheckpoints, ({ one }) => ({
  mission: one(missions, {
    fields: [missionCheckpoints.missionId],
    references: [missions.id],
  }),
}));

export const missionJournalRelations = relations(missionJournal, ({ one }) => ({
  mission: one(missions, {
    fields: [missionJournal.missionId],
    references: [missions.id],
  }),
}));

export const missionReceiptsRelations = relations(missionReceipts, ({ one }) => ({
  mission: one(missions, {
    fields: [missionReceipts.missionId],
    references: [missions.id],
  }),
}));

// ── Inferred Types ───────────────────────────────────────

export type MissionItem = typeof missions.$inferSelect;
export type NewMission = typeof missions.$inferInsert;

export type MissionNodeItem = typeof missionNodes.$inferSelect;
export type NewMissionNode = typeof missionNodes.$inferInsert;

export type MissionApprovalItem = typeof missionApprovals.$inferSelect;
export type NewMissionApproval = typeof missionApprovals.$inferInsert;

export type MissionCheckpointItem = typeof missionCheckpoints.$inferSelect;
export type NewMissionCheckpoint = typeof missionCheckpoints.$inferInsert;

export type MissionJournalItem = typeof missionJournal.$inferSelect;
export type NewMissionJournal = typeof missionJournal.$inferInsert;

export type MissionReceiptItem = typeof missionReceipts.$inferSelect;
export type NewMissionReceipt = typeof missionReceipts.$inferInsert;

// ── 7. Azzar Departments (Phase 2 PostgreSQL Persistence) ─

export const azzarDepartments = pgTable(
  'azzar_departments',
  {
    templateId: text('template_id').primaryKey().notNull(),
    active: boolean('active').notNull().default(true),
    customNameJson: jsonb('custom_name_json'),
    context: text('context').notNull().default(''),
    instructions: text('instructions').notNull().default(''),
    tone: text('tone').notNull().default(''),
    sourcesJson: jsonb('sources_json').notNull().default([]),
    rulesJson: jsonb('rules_json').notNull().default({}),
    activatedAt: timestamptz('activated_at').notNull().defaultNow(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('azzar_departments_active_idx').on(t.active)],
);

// ── 8. Azzar Projects (Phase 2 PostgreSQL Persistence) ────

export const azzarProjects = pgTable(
  'azzar_projects',
  {
    id: text('id').primaryKey().notNull(),
    name: text('name').notNull(),
    description: text('description').notNull().default(''),
    departmentId: text('department_id'),
    context: text('context').notNull().default(''),
    visibility: text('visibility').notNull().default('private'),
    inheritJson: jsonb('inherit_json')
      .notNull()
      .default({ policies: true, sources: false, tone: true }),
    sourcesJson: jsonb('sources_json').notNull().default([]),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('azzar_projects_department_id_idx').on(t.departmentId)],
);

// ── 9. Azzar Agent Installs / My Agents (Phase 2 PostgreSQL Persistence) ─

export const azzarAgentInstalls = pgTable(
  'azzar_agent_installs',
  {
    templateId: text('template_id').primaryKey().notNull(),
    status: text('status').notNull().default('active'),
    departmentIdsJson: jsonb('department_ids_json').notNull().default([]),
    projectIdsJson: jsonb('project_ids_json').notNull().default([]),
    installedAt: timestamptz('installed_at').notNull().defaultNow(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('azzar_agent_installs_status_idx').on(t.status)],
);

export type AzzarDepartmentItem = typeof azzarDepartments.$inferSelect;
export type NewAzzarDepartment = typeof azzarDepartments.$inferInsert;

export type AzzarProjectItem = typeof azzarProjects.$inferSelect;
export type NewAzzarProject = typeof azzarProjects.$inferInsert;

export type AzzarAgentInstallItem = typeof azzarAgentInstalls.$inferSelect;
export type NewAzzarAgentInstall = typeof azzarAgentInstalls.$inferInsert;

