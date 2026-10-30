ALTER TABLE "missions" ADD COLUMN IF NOT EXISTS "project_id" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "missions_project_id_idx" ON "missions" USING btree ("project_id");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "azzar_departments" (
	"template_id" text PRIMARY KEY NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"custom_name_json" jsonb,
	"context" text DEFAULT '' NOT NULL,
	"instructions" text DEFAULT '' NOT NULL,
	"tone" text DEFAULT '' NOT NULL,
	"sources_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"rules_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"activated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "azzar_departments_active_idx" ON "azzar_departments" USING btree ("active");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "azzar_projects" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"department_id" text,
	"context" text DEFAULT '' NOT NULL,
	"visibility" text DEFAULT 'private' NOT NULL,
	"inherit_json" jsonb DEFAULT '{"policies":true,"sources":false,"tone":true}'::jsonb NOT NULL,
	"sources_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "azzar_projects_department_id_idx" ON "azzar_projects" USING btree ("department_id");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "azzar_agent_installs" (
	"template_id" text PRIMARY KEY NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"department_ids_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"project_ids_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"installed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "azzar_agent_installs_status_idx" ON "azzar_agent_installs" USING btree ("status");
