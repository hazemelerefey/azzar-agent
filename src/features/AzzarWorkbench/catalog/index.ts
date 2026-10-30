import { MARKETING_AGENTS } from './agents/marketing';
import { CORE_DEPARTMENT_SPECS, EXTRA_DEPARTMENT_SPECS, INDIVIDUAL_SPECS } from './coreSpecs';
import type { AgentTemplate, DepartmentTemplate, ModelRequirements } from './types';

export * from './types';

const COMING_SOON_MODEL: ModelRequirements = {
  languages: ['ar', 'en'],
  minContextTokens: 128_000,
  toolCalling: true,
};

/** Scripts that exist per department. A department with no scripts cannot run missions yet. */
const SCRIPT_IDS_BY_DEPARTMENT: Record<string, string[]> = {
  marketing: ['marketing.launch-campaign', 'marketing.competitor-brief'],
};

const WORKING_DEPARTMENT_IDS = new Set(['marketing']);

const buildComingSoonAgents = (): AgentTemplate[] => {
  const out: AgentTemplate[] = [];
  for (const spec of CORE_DEPARTMENT_SPECS) {
    if (WORKING_DEPARTMENT_IDS.has(spec.id)) continue;
    const managerId = `${spec.id}-manager`;
    const allTags = spec.does.map((x) => x.tag);
    out.push({
      availability: 'coming-soon',
      data: { cannotTouch: [], canTouch: [] },
      departmentId: spec.id,
      does: spec.does.map(({ ar, en }) => ({ ar, en })),
      doesNot: spec.doesNot,
      exampleMissions: spec.examples,
      fits: allTags,
      id: managerId,
      kind: 'manager',
      major: spec.id,
      modelRequirements: COMING_SOON_MODEL,
      name: spec.managerName,
      role: spec.mission,
      specialistIds: spec.specialists.map((s) => `${spec.id}-${s.tag}`),
      summary: spec.mission,
      tools: [],
      version: '0.0.0',
    });
    for (const s of spec.specialists) {
      const item = spec.does.find((x) => x.tag === s.tag);
      out.push({
        availability: 'coming-soon',
        data: { cannotTouch: [], canTouch: [] },
        departmentId: spec.id,
        does: item ? [{ ar: item.ar, en: item.en }] : [],
        doesNot: spec.doesNot,
        fits: [s.tag],
        id: `${spec.id}-${s.tag}`,
        kind: 'specialist',
        major: spec.id,
        modelRequirements: COMING_SOON_MODEL,
        name: s.name,
        parentId: managerId,
        role: item ? { ar: item.ar, en: item.en } : spec.mission,
        summary: item ? { ar: item.ar, en: item.en } : spec.mission,
        tools: [],
        version: '0.0.0',
      });
    }
  }
  return out;
};

const buildIndividualAgents = (): AgentTemplate[] =>
  INDIVIDUAL_SPECS.map((s) => ({
    availability: 'coming-soon' as const,
    data: { cannotTouch: [], canTouch: [] },
    does: [{ ar: s.summary.ar, en: s.summary.en }],
    doesNot: [],
    fits: [],
    id: s.id,
    kind: 'individual' as const,
    major: s.major,
    modelRequirements: COMING_SOON_MODEL,
    name: s.name,
    role: s.summary,
    summary: s.summary,
    tools: [],
    version: '0.0.0',
  }));

export const AGENT_TEMPLATES: AgentTemplate[] = [
  ...MARKETING_AGENTS,
  ...buildComingSoonAgents(),
  ...buildIndividualAgents(),
];

const buildDepartments = (): DepartmentTemplate[] => {
  const core: DepartmentTemplate[] = CORE_DEPARTMENT_SPECS.map((spec) => ({
    availability: WORKING_DEPARTMENT_IDS.has(spec.id) ? 'working' : 'coming-soon',
    avatarKey: spec.avatarKey,
    does: spec.does.map(({ tag, ar, en }) => ({ tag, text: { ar, en } })),
    doesNot: spec.doesNot,
    exampleMissions: spec.examples,
    id: spec.id,
    managerId: `${spec.id}-manager`,
    mission: spec.mission,
    name: spec.name,
    scriptIds: SCRIPT_IDS_BY_DEPARTMENT[spec.id] ?? [],
    specialistCount: spec.specialists.length,
    specialistIds: spec.specialists.map((s) => `${spec.id}-${s.tag}`),
    tier: spec.tier,
  }));

  // Marketing's specialists use hand-written ids.
  const marketing = core.find((d) => d.id === 'marketing');
  if (marketing) {
    marketing.specialistIds = [
      'marketing-research',
      'marketing-brand',
      'marketing-campaigns',
      'marketing-leads',
    ];
  }

  const extra: DepartmentTemplate[] = EXTRA_DEPARTMENT_SPECS.map((spec) => ({
    availability: 'coming-soon',
    avatarKey: null,
    does: [],
    doesNot: [],
    exampleMissions: [],
    id: spec.id,
    managerId: null,
    mission: spec.mission,
    name: spec.name,
    scriptIds: [],
    specialistCount: 0,
    specialistIds: [],
    tier: spec.tier,
  }));

  return [...core, ...extra];
};

export const DEPARTMENT_TEMPLATES: DepartmentTemplate[] = buildDepartments();

const agentById = new Map(AGENT_TEMPLATES.map((a) => [a.id, a]));
const departmentById = new Map(DEPARTMENT_TEMPLATES.map((d) => [d.id, d]));

export const getAgentTemplate = (id: string): AgentTemplate | undefined => agentById.get(id);
export const getDepartmentTemplate = (id: string): DepartmentTemplate | undefined =>
  departmentById.get(id);

export const CORE_DEPARTMENT_IDS = CORE_DEPARTMENT_SPECS.map((s) => s.id);

/** Starter departments are suggested at activation. They are an offer, never forced. */
export const STARTER_DEPARTMENT_IDS = DEPARTMENT_TEMPLATES.filter((d) => d.tier === 'starter').map(
  (d) => d.id,
);

export const isWorkingAgent = (id: string): boolean =>
  getAgentTemplate(id)?.availability === 'working';

export const AVATAR_ORCHESTRATOR_KEY = '00-azzar-orchestrator';

/** Public URL of an approved avatar. Files ship under `public/azzar/avatars/`. */
export const avatarUrl = (key: string, dark: boolean): string =>
  `/azzar/avatars/${dark ? 'dark' : 'light'}/${key}-${dark ? 'dark' : 'light'}.svg`;
