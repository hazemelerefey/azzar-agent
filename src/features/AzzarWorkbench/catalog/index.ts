import { MARKETING_AGENTS } from './agents/marketing';
import { CORE_DEPARTMENT_SPECS, EXTRA_DEPARTMENT_SPECS, INDIVIDUAL_SPECS } from './coreSpecs';
import type { AgentTemplate, DepartmentTemplate, MissionTemplate, ModelRequirements } from './types';

export * from './types';

const COMING_SOON_MODEL: ModelRequirements = {
  languages: ['ar', 'en'],
  minContextTokens: 128_000,
  toolCalling: true,
};

/** Mission templates that exist per department. A department with no templates cannot run missions yet. */
const SCRIPT_IDS_BY_DEPARTMENT: Record<string, string[]> = {
  marketing: ['marketing.launch-campaign', 'marketing.competitor-brief'],
};

export const MISSION_TEMPLATES: MissionTemplate[] = [
  {
    defaultSuccessCriteria: [
      {
        ar: 'موجز بحث السوق والمنافسين مدعوم بالمصادر الحقيقية',
        en: 'Market and competitor research brief backed by real sources',
      },
      {
        ar: 'موجز العلامة التجارية مع التموضع وركائز الرسالة ونبرة الصوت',
        en: 'Brand brief with positioning, message pillars, and voice rules',
      },
      {
        ar: 'خطة حملة لـ ٣٠ يوماً بمسودات بالعامية المصرية وملخص إنجليزي',
        en: '30-day campaign plan with Egyptian Arabic copy drafts and English summary',
      },
      {
        ar: 'قائمة عملاء محتملين تجريبية (SAMPLE) وفحص حواجز الأمان وبوابة موافقة N6',
        en: 'Sample leads list (SAMPLE), guardrail verification, and N6 approval gate',
      },
    ],
    departmentId: 'marketing',
    description: {
      ar: 'مهمة تسويقية متكاملة من ٧ عقد (N1–N7): بحث، تدقيق الهوية، مسودة الحملة، قائمة عملاء محتملين، فحص الحواجز، بوابة الموافقة، وتوليد الموجز والإيصال.',
      en: 'End-to-end 7-node Marketing Mission (N1–N7): research, brand audit, campaign draft, sample leads, guardrail check, approval gate, and brief + receipt generation.',
    },
    id: 'marketing.launch-campaign',
    managerId: 'marketing-manager',
    suggestedApprovals: ['connector:social-publish', 'connector:email-send', 'connector:crm-write'],
    title: {
      ar: 'إطلاق حملة تسويقية متكاملة (N1–N7)',
      en: 'Launch Marketing Campaign (N1–N7)',
    },
  },
  {
    defaultSuccessCriteria: [
      {
        ar: 'مقارنة شاملة للمنافسين مع الروابط الموثقة',
        en: 'Comprehensive competitor comparison with verified links',
      },
      {
        ar: 'ثلاث توصيات استراتيجية للتموضع في السوق المصري',
        en: 'Three strategic positioning recommendations for the Egyptian market',
      },
    ],
    departmentId: 'marketing',
    description: {
      ar: 'موجز تحليل المنافسين والجمهور المستهدف مع تدقيق الهوية وتوليد التقرير المعتمد.',
      en: 'Competitor and target audience analysis brief with brand audit and approved report generation.',
    },
    id: 'marketing.competitor-brief',
    managerId: 'marketing-manager',
    suggestedApprovals: ['connector:social-publish'],
    title: {
      ar: 'موجز تحليل المنافسين والسوق',
      en: 'Competitor & Market Intelligence Brief',
    },
  },
];

const missionTemplateById = new Map(MISSION_TEMPLATES.map((m) => [m.id, m]));
export const getMissionTemplate = (id: string): MissionTemplate | undefined =>
  missionTemplateById.get(id);

const AVAILABLE_DEPARTMENT_IDS = new Set(['marketing']);

const buildComingSoonAgents = (): AgentTemplate[] => {
  const out: AgentTemplate[] = [];
  for (const spec of CORE_DEPARTMENT_SPECS) {
    if (AVAILABLE_DEPARTMENT_IDS.has(spec.id)) continue;
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
    availability: AVAILABLE_DEPARTMENT_IDS.has(spec.id) ? 'available' : 'coming-soon',
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

export const isAvailableAgent = (id: string): boolean =>
  getAgentTemplate(id)?.availability === 'available';

export const AVATAR_ORCHESTRATOR_KEY = '00-azzar-orchestrator';

/** Public URL of an approved avatar. Files ship under `public/azzar/avatars/`. */
export const avatarUrl = (key: string, dark: boolean): string =>
  `/azzar/avatars/${dark ? 'dark' : 'light'}/${key}-${dark ? 'dark' : 'light'}.svg`;
