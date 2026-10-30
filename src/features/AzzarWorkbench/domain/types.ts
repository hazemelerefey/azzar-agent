import type { ApprovalLevel, Bi } from '../catalog';

export type WorkbenchMode = 'individual' | 'company';

/* ------------------------------------------------------------------ memory */

export type MemoryLayer = 'global' | 'department' | 'project' | 'agent' | 'mission';

export interface MemoryEntry {
  createdAt: string;
  id: string;
  layer: MemoryLayer;
  /** Id of the owner of this layer: department id, project id, agent id, mission id. `global` for global. */
  scopeId: string;
  /** Only shareable entries can be read by a layer below. Everything else stays private to its layer. */
  shareable?: boolean;
  /** Mission this entry was summarised from, when it came from a completed mission. */
  sourceMissionId?: string;
  text: Bi;
}

export interface Source {
  content?: string;
  id: string;
  kind: 'file' | 'link' | 'note';
  name: string;
  /** A source is private to its owner unless it is marked shareable. Shareable sources can be inherited. */
  shareable: boolean;
}

/* ------------------------------------------------------------------- rules */

export type RunLocation = 'employee-device' | 'company-server';
export type RuleRole = 'manager' | 'specialist';

export interface RoleAccess {
  read: boolean;
  send: boolean;
  write: boolean;
}

export interface RuleSet {
  inherit: {
    /** Defaults a new project receives from its department. */
    policies: boolean;
    sources: boolean;
    tone: boolean;
  };
  memory: {
    digestToDepartment: boolean;
    digestToGlobal: boolean;
  };
  /**
   * Model choice per department. The lock is stored and shown in the UI. It is NOT enforced on
   * the server yet, and every screen that shows it says "UI only".
   */
  model: { lock: boolean; modelId: string | null };
  roleAccess: Record<RuleRole, RoleAccess>;
  runLocation: RunLocation;
  /** Overrides of a tool's default level. Missing keys use the template default. */
  toolLevels: Record<string, ApprovalLevel>;
}

/* -------------------------------------------------------------- departments */

export interface ActiveDepartment {
  activatedAt: string;
  active: boolean;
  /** Free text the department keeps about what it does and its policies. */
  context: string;
  /** Names for custom departments. Template departments use the template name. */
  customName?: Bi;
  instructions: string;
  rules: RuleSet;
  sources: Source[];
  templateId: string;
  tone: string;
}

/* ---------------------------------------------------------------- installs */

export interface InstalledAgent {
  /** A department or project id. An agent may belong to several (decision Q2). */
  departmentIds: string[];
  installedAt: string;
  projectIds: string[];
  status: 'active' | 'paused';
  templateId: string;
}

/* ---------------------------------------------------------------- projects */

export interface Project {
  context: string;
  createdAt: string;
  /** Department id, or null for a standalone project. */
  departmentId: string | null;
  description: string;
  id: string;
  /** What this project receives from its department. Opt-in per field. */
  inherit: { policies: boolean; sources: boolean; tone: boolean };
  name: string;
  sources: Source[];
  /** Department projects default to private (decision D11). */
  visibility: 'private' | 'shared';
}

/* ---------------------------------------------------------------- missions */

export type MissionStatus = 'running' | 'waiting_approval' | 'completed' | 'cancelled';
export type NodeKind = 'task' | 'decision' | 'finding' | 'batch';
export type NodeStatus = 'pending' | 'running' | 'done' | 'blocked' | 'needs_human';
export type OwnerType = 'department' | 'project' | 'agent' | 'self';

export interface GraphNode {
  agentId: string;
  id: string;
  kind: NodeKind;
  output?: Bi;
  parentId?: string;
  status: NodeStatus;
  stepId: string;
  title: Bi;
}

export type RunEventType =
  | 'plan'
  | 'spawn'
  | 'work'
  | 'action'
  | 'approval_requested'
  | 'approval_resolved'
  | 'blocked'
  | 'verify'
  | 'close'
  | 'report'
  | 'completed'
  | 'cancelled';

export interface RunEvent {
  agentId: string;
  at: string;
  id: string;
  text: Bi;
  toolId?: string;
  type: RunEventType;
}

export interface Approval {
  id: string;
  label: Bi;
  requestedAt: string;
  resolvedAt?: string;
  status: 'pending' | 'approved' | 'rejected';
  stepId: string;
  summary: Bi;
  toolId: string;
}

export interface Blocker {
  id: string;
  needsDecision: boolean;
  stepId: string;
  text: Bi;
}

export interface ReportedAction {
  id: string;
  stepId: string;
  text: Bi;
  toolId: string;
}

export interface MissionReport {
  blockers: Bi[];
  decisions: Bi[];
  done: Bi[];
  evidence: Bi[];
  next: Bi;
  outcome: Bi;
}

export interface Mission {
  /** Ids of agents that are alive right now. Specialists are closed when their job ends. */
  activeSpecialists: string[];
  approvals: Approval[];
  /** Approval topics the owner asked to be gated, in addition to the Rules. */
  approvalsNeeded: string[];
  blockers: Blocker[];
  /** Round and cost caps, mirroring `goals.max_rounds` and `goals.max_total_cost`. */
  budget: { maxRounds: number; maxTotalCostUsd: number };
  completedAt?: string;
  /** Simulated cost, in USD. Never a real charge. */
  costUsd: number;
  createdAt: string;
  cursor: number;
  deadline: string;
  departmentId: string | null;
  events: RunEvent[];
  executionMode?: 'live' | 'simulated';
  goal: string;
  id: string;
  isGenerating?: boolean;
  modelId?: string;
  nodes: GraphNode[];
  ownerId: string;
  ownerType: OwnerType;
  projectId: string | null;
  report?: MissionReport;
  reported: ReportedAction[];
  scriptId: string;
  /** Whether the mission was executed as simulation or with live LLM. */
  simulated: boolean;
  status: MissionStatus;
  successCriteria: string[];
  tokensUsed?: number;
}

/* ------------------------------------------------------------------- state */

export interface WorkbenchData {
  departments: Record<string, ActiveDepartment>;
  installs: Record<string, InstalledAgent>;
  /** Admin-only gate for the Chief Agent Orchestrator (CAO) tree. Default false for regular users. */
  isAdmin?: boolean;
  /** When the user last opened the briefing. Used for the "while you were away" section. */
  lastSeenAt: string | null;
  memory: MemoryEntry[];
  missions: Mission[];
  mode: WorkbenchMode | null;
  /** Personal rules for Individual mode. Company mode uses the department rule sets. */
  personalRules: RuleSet;
  projects: Project[];
}
