/**
 * AZZAR Workbench catalog types.
 *
 * Everything the workbench knows about departments and agents is DATA described by these
 * types. Marketing is the first working entry; adding another department later means adding
 * data files and a script, not changing logic.
 */

export type Lang = 'ar' | 'en';

/** Bilingual text. Product copy is Arabic and English only. */
export interface Bi {
  ar: string;
  en: string;
}

/**
 * How much freedom an agent has for one tool action. Maps onto the existing runtime:
 * - alone     → approvalMode `auto-run`
 * - report    → approvalMode `allow-list`, and the action is listed in the briefing
 * - tap       → approvalMode `manual` (the human-approval pause)
 * - forbidden → the tool is not granted to the agent
 */
export type ApprovalLevel = 'alone' | 'report' | 'tap' | 'forbidden';

export const APPROVAL_LEVELS: ApprovalLevel[] = ['alone', 'report', 'tap', 'forbidden'];

export type ToolSource = 'builtin' | 'connector';

export type ToolAccess = 'read' | 'write' | 'send';

export interface ToolGrant {
  /** What kind of action this tool performs. Department roles can be limited per kind. */
  access: ToolAccess;
  /** Default level. A department Rule can override it. */
  defaultLevel: ApprovalLevel;
  /**
   * Stable id. Builtin tools use `<identifier>/<apiName>` exactly as the runtime names them.
   * Connector tools use `connector:<name>` and need a connector set up before a real run.
   */
  id: string;
  label: Bi;
  note?: Bi;
  source: ToolSource;
}

export interface DataBoundary {
  cannotTouch: Bi[];
  canTouch: Bi[];
}

export interface ModelRequirements {
  languages: Lang[];
  minContextTokens: number;
  notes?: Bi;
  toolCalling: boolean;
}

export type Availability = 'working' | 'coming-soon';
export type AgentKind = 'manager' | 'specialist' | 'individual';

export interface AgentTemplate {
  availability: Availability;
  data: DataBoundary;
  /** The department this agent belongs to. Individual agents have none. */
  departmentId?: string;
  /** Things this agent does, and does not do. Shown on the Marketplace card. */
  does: Bi[];
  doesNot: Bi[];
  /** Example missions that show what this agent is for. */
  exampleMissions?: Bi[];
  /** Tags this agent serves. The matcher compares them with the department's `does` tags. */
  fits: string[];
  id: string;
  kind: AgentKind;
  major: string;
  modelRequirements: ModelRequirements;
  name: Bi;
  /** Specialist parent. Specialists are temporary and use their parent's avatar. */
  parentId?: string;
  role: Bi;
  /** Ids of temporary specialists this manager can spawn. */
  specialistIds?: string[];
  summary: Bi;
  /** Full production system role with {{PLACEHOLDERS}}. Only agents that work have one. */
  systemRole?: string;
  tools: ToolGrant[];
  version: string;
}

export type DepartmentTier = 'starter' | 'growth' | 'enterprise' | 'optional' | 'custom';

export interface DoesItem {
  tag: string;
  text: Bi;
}

export interface DepartmentTemplate {
  availability: Availability;
  /** Key of the approved avatar file (`03-marketing`), or null for a neutral monogram tile. */
  avatarKey: string | null;
  does: DoesItem[];
  doesNot: Bi[];
  exampleMissions: Bi[];
  id: string;
  managerId: string | null;
  mission: Bi;
  name: Bi;
  /** Ids of mission scripts that can run for this department. Empty means none yet. */
  scriptIds: string[];
  specialistCount: number;
  specialistIds: string[];
  tier: DepartmentTier;
}
