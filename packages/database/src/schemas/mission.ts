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
    mode: text('mode').notNull().default('company'),
    status: text('status').notNull().default('pending'),
    dagJson: jsonb('dag_json').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('missions_department_id_idx').on(t.departmentId),
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
