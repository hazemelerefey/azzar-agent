CREATE TABLE "mission_approvals" (
	"id" text PRIMARY KEY NOT NULL,
	"mission_id" text NOT NULL,
	"node_id" text NOT NULL,
	"tool_id" text,
	"shown_payload" text NOT NULL,
	"shown_payload_hash" text NOT NULL,
	"decision" text,
	"decided_by" text,
	"decided_at" timestamp with time zone,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mission_checkpoints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mission_id" text NOT NULL,
	"snapshot_json" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mission_journal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mission_id" text NOT NULL,
	"event_type" text NOT NULL,
	"payload_json" jsonb NOT NULL,
	"source_event_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mission_nodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mission_id" text NOT NULL,
	"node_id" text NOT NULL,
	"assignee" text NOT NULL,
	"depends_on_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"expected_output_schema" jsonb,
	"allowed_tool_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"approval_required" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mission_receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mission_id" text NOT NULL,
	"receipt_json" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "missions" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"department_id" text DEFAULT 'marketing' NOT NULL,
	"mode" text DEFAULT 'company' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"dag_json" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mission_approvals" ADD CONSTRAINT "mission_approvals_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_checkpoints" ADD CONSTRAINT "mission_checkpoints_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_journal" ADD CONSTRAINT "mission_journal_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_nodes" ADD CONSTRAINT "mission_nodes_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_receipts" ADD CONSTRAINT "mission_receipts_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "mission_approvals_mission_id_idx" ON "mission_approvals" USING btree ("mission_id");--> statement-breakpoint
CREATE INDEX "mission_approvals_shown_payload_hash_idx" ON "mission_approvals" USING btree ("shown_payload_hash");--> statement-breakpoint
CREATE INDEX "mission_checkpoints_mission_id_idx" ON "mission_checkpoints" USING btree ("mission_id");--> statement-breakpoint
CREATE INDEX "mission_journal_mission_id_idx" ON "mission_journal" USING btree ("mission_id");--> statement-breakpoint
CREATE INDEX "mission_journal_event_type_idx" ON "mission_journal" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "mission_nodes_mission_id_idx" ON "mission_nodes" USING btree ("mission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mission_nodes_mission_id_node_id_unique" ON "mission_nodes" USING btree ("mission_id","node_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mission_receipts_mission_id_unique" ON "mission_receipts" USING btree ("mission_id");--> statement-breakpoint
CREATE INDEX "missions_department_id_idx" ON "missions" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "missions_status_idx" ON "missions" USING btree ("status");