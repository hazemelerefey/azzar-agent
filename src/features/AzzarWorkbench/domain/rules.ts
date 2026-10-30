import type { ApprovalLevel, ToolGrant } from '../catalog';
import type { Mission, RuleRole, RuleSet } from './types';

export const defaultRuleSet = (): RuleSet => ({
  inherit: { policies: true, sources: false, tone: true },
  memory: { digestToDepartment: true, digestToGlobal: false },
  model: { lock: false, modelId: null },
  roleAccess: {
    manager: { read: true, send: true, write: true },
    // Specialists draft and research. Anything that goes outward is gated by the manager.
    specialist: { read: true, send: false, write: true },
  },
  runLocation: 'company-server',
  toolLevels: {},
});

const STRICTNESS: Record<ApprovalLevel, number> = { alone: 0, forbidden: 3, report: 1, tap: 2 };

export const stricter = (a: ApprovalLevel, b: ApprovalLevel): ApprovalLevel =>
  STRICTNESS[a] >= STRICTNESS[b] ? a : b;

/**
 * The level that applies to one tool for one role. Rules always win over the template default.
 * A role that has no access of that kind (read, write, send) is forbidden.
 */
export const effectiveLevel = (rules: RuleSet, tool: ToolGrant, role: RuleRole): ApprovalLevel => {
  if (!rules.roleAccess[role][tool.access]) return 'forbidden';
  return rules.toolLevels[tool.id] ?? tool.defaultLevel;
};

/**
 * Same as `effectiveLevel`, and the owner of a mission can only make it stricter: a tool the
 * owner listed under "approvals needed" is at least a tap, unless it is already forbidden.
 */
export const missionLevel = (
  rules: RuleSet,
  tool: ToolGrant,
  role: RuleRole,
  mission: Pick<Mission, 'approvalsNeeded'>,
): ApprovalLevel => {
  const base = effectiveLevel(rules, tool, role);
  return mission.approvalsNeeded.includes(tool.id) ? stricter(base, 'tap') : base;
};

/**
 * Production mapping to the existing runtime tool approval modes. `null` means the tool is
 * not granted to the agent at all.
 */
export const toRuntimeApprovalMode = (
  level: ApprovalLevel,
): 'auto-run' | 'allow-list' | 'manual' | null => {
  switch (level) {
    case 'alone': {
      return 'auto-run';
    }
    case 'report': {
      return 'allow-list';
    }
    case 'tap': {
      return 'manual';
    }
    default: {
      return null;
    }
  }
};

export const setToolLevel = (
  rules: RuleSet,
  toolId: string,
  level: ApprovalLevel,
  defaultLevel: ApprovalLevel,
): RuleSet => {
  const toolLevels = { ...rules.toolLevels };
  // Storing the default would hide later changes to the template default, so store overrides only.
  if (level === defaultLevel) delete toolLevels[toolId];
  else toolLevels[toolId] = level;
  return { ...rules, toolLevels };
};
