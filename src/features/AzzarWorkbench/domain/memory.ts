import type { Bi } from '../catalog';
import type {
  ActiveDepartment,
  MemoryEntry,
  MemoryLayer,
  Mission,
  Project,
  RuleSet,
  Source,
  WorkbenchData,
} from './types';

/**
 * Memory hierarchy rules:
 * - Context flows DOWN: a project can inherit department tone, policies and shareable sources.
 * - Knowledge flows UP only as a summary, and only when a Rule allows it.
 * - Nothing flows sideways. A department never reads another department's memory.
 */

export interface MemoryScope {
  agentId?: string;
  departmentId?: string | null;
  missionId?: string;
  projectId?: string | null;
}

const entryId = (layer: MemoryLayer, scopeId: string, missionId: string) =>
  `${layer}:${scopeId}:${missionId}`;

/**
 * What a reader at the given scope may see. Global entries are always visible. Entries of the
 * reader's own layers are visible. A project also sees its department's entries that are marked
 * shareable. Every other department's and project's entries are never visible.
 */
export const visibleMemory = (
  data: Pick<WorkbenchData, 'memory'>,
  scope: MemoryScope,
): MemoryEntry[] =>
  data.memory.filter((m) => {
    switch (m.layer) {
      case 'global': {
        return true;
      }
      case 'department': {
        if (!scope.departmentId || m.scopeId !== scope.departmentId) return false;
        return true;
      }
      case 'project': {
        return Boolean(scope.projectId) && m.scopeId === scope.projectId;
      }
      case 'agent': {
        return Boolean(scope.agentId) && m.scopeId === scope.agentId;
      }
      case 'mission': {
        return Boolean(scope.missionId) && m.scopeId === scope.missionId;
      }
      default: {
        return false;
      }
    }
  });

/**
 * Memory a PROJECT may read from its department: only shareable entries, because project memory
 * inherits department context, not department history.
 */
export const departmentMemoryForProject = (
  data: Pick<WorkbenchData, 'memory'>,
  departmentId: string | null,
): MemoryEntry[] =>
  departmentId
    ? data.memory.filter(
        (m) => m.layer === 'department' && m.scopeId === departmentId && m.shareable,
      )
    : [];

export interface InheritedContext {
  policies: string;
  sources: Source[];
  tone: string;
}

/**
 * What a project receives from its department, field by field. Each field is opt-in on the
 * project (its `inherit` flags). Sources are inherited only when the department marked them
 * shareable.
 */
export const effectiveProjectContext = (
  project: Pick<Project, 'inherit'>,
  department: Pick<ActiveDepartment, 'context' | 'instructions' | 'sources' | 'tone'> | undefined,
): InheritedContext => {
  if (!department) return { policies: '', sources: [], tone: '' };
  return {
    policies: project.inherit.policies
      ? [department.context, department.instructions].filter(Boolean).join('\n\n')
      : '',
    sources: project.inherit.sources ? department.sources.filter((s) => s.shareable) : [],
    tone: project.inherit.tone ? department.tone : '',
  };
};

export const summarizeMission = (mission: Mission): Bi =>
  mission.report
    ? mission.report.outcome
    : {
        ar: `مهمة قيد التنفيذ: ${mission.goal}`,
        en: `Mission in progress: ${mission.goal}`,
      };

/**
 * Entries to add when a mission completes. The mission keeps its own entry. A summary goes up to
 * the project, then (if the department Rules allow) a digest to the department, then (if
 * allowed) a digest to global memory.
 */
export const memoryForCompletedMission = (
  mission: Mission,
  rules: Pick<RuleSet, 'memory'>,
  now: string,
): MemoryEntry[] => {
  const text = summarizeMission(mission);
  const out: MemoryEntry[] = [
    {
      createdAt: now,
      id: entryId('mission', mission.id, mission.id),
      layer: 'mission',
      scopeId: mission.id,
      sourceMissionId: mission.id,
      text,
    },
  ];
  if (mission.projectId) {
    out.push({
      createdAt: now,
      id: entryId('project', mission.projectId, mission.id),
      layer: 'project',
      scopeId: mission.projectId,
      sourceMissionId: mission.id,
      text,
    });
  }
  if (mission.departmentId && rules.memory.digestToDepartment) {
    out.push({
      createdAt: now,
      id: entryId('department', mission.departmentId, mission.id),
      layer: 'department',
      scopeId: mission.departmentId,
      sourceMissionId: mission.id,
      text,
    });
  }
  if (rules.memory.digestToGlobal) {
    out.push({
      createdAt: now,
      id: entryId('global', 'global', mission.id),
      layer: 'global',
      scopeId: 'global',
      sourceMissionId: mission.id,
      text,
    });
  }
  return out;
};
