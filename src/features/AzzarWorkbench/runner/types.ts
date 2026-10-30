import type { Bi } from '../catalog';
import type { Mission, MissionReport, NodeKind } from '../domain/types';

export type StepKind = 'plan' | 'spawn' | 'work' | 'action' | 'verify' | 'close' | 'report';

export interface ScriptStep {
  /** For `action` steps: label shown on the approval card. */
  actionLabel?: Bi;
  /** Who performs the step. Specialists are templates, spawned and closed by the manager. */
  actor: string;
  /** For `action` steps: text of the approval card, in plain language. */
  approvalSummary?: Bi;
  /** For `action` steps: recorded when the Rules forbid the action. */
  blockedText?: Bi;
  /** Simulated cost, in USD. */
  costUsd: number;
  detail?: Bi;
  id: string;
  kind: StepKind;
  nodeKind?: NodeKind;
  /** The result of the step. For `action` steps, what happened once it ran. */
  output?: Bi;
  /** Step whose node this step hangs under. Defaults to the plan node. */
  parentStep?: string;
  /** For `action` steps: recorded when the person refuses the approval. */
  rejectedText?: Bi;
  title: Bi;
  /** For `action` steps: the tool the Rules gate. */
  toolId?: string;
}

export interface MissionScript {
  buildReport: (mission: Mission) => MissionReport;
  defaultSuccessCriteria: Bi[];
  departmentId: string;
  description: Bi;
  id: string;
  /** The manager that runs this script. Its tools are the ones the Rules gate. */
  managerId: string;
  steps: ScriptStep[];
  /** Tools this script may ask a person to approve. Shown as suggestions on the new-mission form. */
  suggestedApprovals: string[];
  title: Bi;
}
