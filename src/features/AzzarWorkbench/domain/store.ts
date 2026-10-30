import { createJSONStorage, persist } from 'zustand/middleware';
import { createStore, type StoreApi } from 'zustand/vanilla';

import { missionService } from '@/services/mission';

import { type Bi, getAgentTemplate, getDepartmentTemplate, getMissionTemplate } from '../catalog';
import { memoryForCompletedMission } from './memory';
import { defaultRuleSet } from './rules';
import type {
  ActiveDepartment,
  InstalledAgent,
  Mission,
  OwnerType,
  Project,
  RuleSet,
  Source,
  WorkbenchData,
  WorkbenchMode,
} from './types';

export type ActionError =
  | 'agent-not-assigned'
  | 'agent-not-installed'
  | 'agent-paused'
  | 'coming-soon'
  | 'department-inactive'
  | 'invalid-input'
  | 'not-found'
  | 'script-missing'
  | 'specialist-not-installable';

export type ActionResult<T = undefined> =
  { ok: true; value: T } | { ok: false; reason: ActionError };

const ok = <T>(value: T): ActionResult<T> => ({ ok: true, value });
const fail = (reason: ActionError): ActionResult<never> => ({ ok: false, reason });

export interface LaunchMissionInput {
  approvalsNeeded: string[];
  deadline: string;
  goal: string;
  modelId?: string;
  ownerId: string;
  ownerType: OwnerType;
  scriptId: string;
  successCriteria: string[];
}

export interface ValidatedMissionContext {
  departmentId: string | null;
  projectId: string | null;
}

export interface WorkbenchActions {
  activateDepartment: (templateId: string, customName?: Bi) => ActionResult<ActiveDepartment>;
  assignAgent: (
    templateId: string,
    target: { departmentId?: string; projectId?: string },
  ) => ActionResult;
  createProject: (input: {
    context?: string;
    departmentId: string | null;
    description: string;
    name: string;
  }) => ActionResult<Project>;
  deactivateDepartment: (templateId: string) => void;
  hydrateFromServer: () => Promise<void>;
  installAgent: (
    templateId: string,
    target?: { departmentId?: string; projectId?: string },
  ) => ActionResult;
  markBriefingSeen: () => void;
  reset: () => void;
  setAdminMode: (isAdmin: boolean) => void;
  setDepartmentRules: (templateId: string, rules: RuleSet) => void;
  setMode: (mode: WorkbenchMode) => void;
  setPersonalRules: (rules: RuleSet) => void;
  syncMissions: (missions: Mission[]) => void;
  syncWorkbenchState: (payload: {
    departments: Record<string, ActiveDepartment>;
    installs: Record<string, InstalledAgent>;
    isAdmin?: boolean;
    projects: Project[];
  }) => void;
  unassignAgent: (
    templateId: string,
    target: { departmentId?: string; projectId?: string },
  ) => void;
  uninstallAgent: (templateId: string) => void;
  updateDepartment: (
    templateId: string,
    patch: Partial<
      Pick<ActiveDepartment, 'context' | 'customName' | 'instructions' | 'sources' | 'tone'>
    >,
  ) => void;
  updateProject: (
    projectId: string,
    patch: Partial<
      Pick<Project, 'context' | 'description' | 'inherit' | 'name' | 'sources' | 'visibility'>
    >,
  ) => void;
  validateMissionLaunch: (input: LaunchMissionInput) => ActionResult<ValidatedMissionContext>;
}

export type WorkbenchState = WorkbenchActions & WorkbenchData;

export interface StoreOptions {
  id?: (prefix: string) => string;
  now?: () => string;
  /** Storage key. Null disables persistence (tests). */
  persistKey?: string | null;
}

export const emptyData = (): WorkbenchData => ({
  departments: {},
  installs: {},
  isAdmin: false,
  lastSeenAt: null,
  memory: [],
  missions: [],
  mode: 'company',
  personalRules: defaultRuleSet(),
  projects: [],
});

let counter = 0;
const defaultId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${(counter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const rulesForMission = (data: WorkbenchData, m: Mission): RuleSet =>
  (m.departmentId && data.departments[m.departmentId]?.rules) || data.personalRules;

const safeStorage = () => {
  try {
    if (typeof localStorage === 'undefined') return undefined;
    localStorage.setItem('__azzar_probe__', '1');
    localStorage.removeItem('__azzar_probe__');
    return localStorage;
  } catch {
    return undefined;
  }
};

export const createWorkbenchStore = (options: StoreOptions = {}): StoreApi<WorkbenchState> => {
  const now = options.now ?? (() => new Date().toISOString());
  const newId = options.id ?? defaultId;

  const isServerRuntime = options.persistKey !== null && process.env.NODE_ENV !== 'test';

  const creator = (
    set: StoreApi<WorkbenchState>['setState'],
    get: StoreApi<WorkbenchState>['getState'],
  ): WorkbenchState => ({
    ...emptyData(),

    activateDepartment: (templateId, customName) => {
      const isCustom = templateId === 'custom' || templateId.startsWith('custom-');
      const template = getDepartmentTemplate(isCustom ? 'custom' : templateId);
      if (!template) return fail('not-found');
      const existing = get().departments[templateId];
      const dept: ActiveDepartment = existing
        ? { ...existing, active: true, customName: customName ?? existing.customName }
        : {
            activatedAt: now(),
            active: true,
            context: '',
            customName,
            instructions: '',
            rules: defaultRuleSet(),
            sources: [],
            templateId,
            tone: '',
          };
      set((s) => ({ departments: { ...s.departments, [templateId]: dept } }));
      if (isServerRuntime) {
        void missionService
          .activateDepartment({
            context: dept.context,
            customName: dept.customName,
            instructions: dept.instructions,
            templateId,
            tone: dept.tone,
          })
          .catch(() => {});
      }
      return ok(dept);
    },

    assignAgent: (templateId, target) => {
      const inst = get().installs[templateId];
      if (!inst) return fail('agent-not-installed');
      set((s) => ({
        installs: {
          ...s.installs,
          [templateId]: {
            ...inst,
            departmentIds:
              target.departmentId && !inst.departmentIds.includes(target.departmentId)
                ? [...inst.departmentIds, target.departmentId]
                : inst.departmentIds,
            projectIds:
              target.projectId && !inst.projectIds.includes(target.projectId)
                ? [...inst.projectIds, target.projectId]
                : inst.projectIds,
          },
        },
      }));
      if (isServerRuntime) {
        void missionService
          .assignAgent({
            departmentId: target.departmentId,
            projectId: target.projectId,
            templateId,
          })
          .catch(() => {});
      }
      return ok(undefined);
    },

    createProject: ({ context = '', departmentId, description, name }) => {
      if (!name.trim()) return fail('invalid-input');
      const dept = departmentId ? get().departments[departmentId] : undefined;
      if (departmentId && !dept?.active) return fail('department-inactive');
      const project: Project = {
        context,
        createdAt: now(),
        departmentId,
        description: description.trim(),
        id: newId('prj'),
        inherit: dept
          ? { ...dept.rules.inherit }
          : { policies: false, sources: false, tone: false },
        name: name.trim(),
        sources: [],
        visibility: 'private',
      };
      set((s) => ({ projects: [...s.projects, project] }));
      if (isServerRuntime) {
        void missionService
          .createProject({
            context: project.context,
            departmentId: project.departmentId,
            description: project.description,
            id: project.id,
            name: project.name,
            visibility: project.visibility,
          })
          .catch(() => {});
      }
      return ok(project);
    },

    deactivateDepartment: (templateId) => {
      const d = get().departments[templateId];
      if (!d) return;
      set((s) => ({ departments: { ...s.departments, [templateId]: { ...d, active: false } } }));
      if (isServerRuntime) {
        void missionService.deactivateDepartment(templateId).catch(() => {});
      }
    },

    hydrateFromServer: async () => {
      if (!isServerRuntime) return;
      try {
        const state = await missionService.getWorkbenchState();
        get().syncWorkbenchState(state);
      } catch {
        // Offline fallback keeps current in-memory state
      }
    },

    installAgent: (templateId, target) => {
      const template = getAgentTemplate(templateId);
      if (!template) return fail('not-found');
      if (template.availability !== 'available') return fail('coming-soon');
      if (template.kind === 'specialist') return fail('specialist-not-installable');
      const existing = get().installs[templateId];
      if (!existing) {
        set((s) => ({
          installs: {
            ...s.installs,
            [templateId]: {
              departmentIds: [],
              installedAt: now(),
              projectIds: [],
              status: 'active',
              templateId,
            },
          },
        }));
      }
      if (isServerRuntime) {
        void missionService
          .installAgent({
            departmentId: target?.departmentId,
            projectId: target?.projectId,
            templateId,
          })
          .catch(() => {});
      }
      return target ? get().assignAgent(templateId, target) : ok(undefined);
    },

    markBriefingSeen: () => set({ lastSeenAt: now() }),

    reset: () => set({ ...emptyData() }),

    setAdminMode: (isAdmin) => set({ isAdmin }),

    setDepartmentRules: (templateId, rules) => {
      const d = get().departments[templateId];
      if (!d) return;
      set((s) => ({ departments: { ...s.departments, [templateId]: { ...d, rules } } }));
      if (isServerRuntime) {
        void missionService.updateDepartment({ rules, templateId }).catch(() => {});
      }
    },

    setMode: (mode) => set({ mode }),

    setPersonalRules: (rules) => set({ personalRules: rules }),

    syncMissions: (missions) => {
      set((cur) => {
        const knownMemory = new Set(cur.memory.map((e) => e.id));
        const newMemory = [...cur.memory];
        for (const m of missions) {
          if (m.status === 'completed') {
            const entries = memoryForCompletedMission(m, rulesForMission(cur, m), now());
            for (const entry of entries) {
              if (!knownMemory.has(entry.id)) {
                knownMemory.add(entry.id);
                newMemory.push(entry);
              }
            }
          }
        }
        return { memory: newMemory, missions };
      });
    },

    syncWorkbenchState: (payload) => {
      set((cur) => ({
        departments: payload.departments,
        installs: payload.installs,
        isAdmin: payload.isAdmin ?? cur.isAdmin,
        projects: payload.projects,
      }));
    },

    unassignAgent: (templateId, target) => {
      const inst = get().installs[templateId];
      if (!inst) return;
      set((s) => ({
        installs: {
          ...s.installs,
          [templateId]: {
            ...inst,
            departmentIds: inst.departmentIds.filter((id) => id !== target.departmentId),
            projectIds: inst.projectIds.filter((id) => id !== target.projectId),
          },
        },
      }));
      if (isServerRuntime) {
        void missionService
          .unassignAgent({
            departmentId: target.departmentId,
            projectId: target.projectId,
            templateId,
          })
          .catch(() => {});
      }
    },

    uninstallAgent: (templateId) => {
      set((s) => {
        const { [templateId]: _removed, ...rest } = s.installs;
        return { installs: rest };
      });
      if (isServerRuntime) {
        void missionService.uninstallAgent(templateId).catch(() => {});
      }
    },

    updateDepartment: (templateId, patch) => {
      const d = get().departments[templateId];
      if (!d) return;
      const updated = { ...d, ...patch };
      set((s) => ({ departments: { ...s.departments, [templateId]: updated } }));
      if (isServerRuntime) {
        void missionService
          .updateDepartment({
            context: updated.context,
            customName: updated.customName,
            instructions: updated.instructions,
            sources: updated.sources,
            templateId,
            tone: updated.tone,
          })
          .catch(() => {});
      }
    },

    updateProject: (projectId, patch) => {
      set((s) => ({
        projects: s.projects.map((p) => (p.id === projectId ? { ...p, ...patch } : p)),
      }));
      if (isServerRuntime) {
        void missionService.updateProject({ id: projectId, ...patch }).catch(() => {});
      }
    },

    validateMissionLaunch: (input) => {
      const s = get();
      const template = getMissionTemplate(input.scriptId);
      if (!template) return fail('script-missing');
      if (!input.goal.trim() || input.successCriteria.every((c) => !c.trim()) || !input.deadline) {
        return fail('invalid-input');
      }

      let departmentId: string | null = null;
      let projectId: string | null = null;
      if (input.ownerType === 'department') departmentId = input.ownerId;
      else if (input.ownerType === 'project') {
        const p = s.projects.find((x) => x.id === input.ownerId);
        if (!p) return fail('not-found');
        projectId = p.id;
        departmentId = p.departmentId;
      } else if (input.ownerType === 'agent') {
        departmentId =
          s.mode === 'company' ? (getAgentTemplate(input.ownerId)?.departmentId ?? null) : null;
      }

      if (departmentId && !s.departments[departmentId]?.active) return fail('department-inactive');
      if (departmentId && getDepartmentTemplate(departmentId)?.availability !== 'available') {
        return fail('coming-soon');
      }
      const inst = s.installs[template.managerId];
      if (!inst) return fail('agent-not-installed');
      if (inst.status !== 'active') return fail('agent-paused');
      const assigned =
        !departmentId ||
        inst.departmentIds.includes(departmentId) ||
        (projectId !== null && inst.projectIds.includes(projectId));
      if (!assigned) return fail('agent-not-assigned');

      return ok({ departmentId, projectId });
    },
  });

  const key = options.persistKey === undefined ? 'azzar-workbench-v1' : options.persistKey;
  if (key === null) return createStore<WorkbenchState>()(creator);

  return createStore<WorkbenchState>()(
    persist(creator, {
      name: key,
      partialize: (s): WorkbenchData => ({
        // Departments, My Agents installs, projects, missions, and admin auth are persisted in PostgreSQL
        departments: {},
        installs: {},
        isAdmin: false,
        lastSeenAt: s.lastSeenAt,
        memory: s.memory,
        missions: [],
        mode: s.mode,
        personalRules: s.personalRules,
        projects: [],
      }),
      storage: createJSONStorage(() => safeStorage() as Storage),
      version: 1,
    }),
  );
};

export type { Source };
