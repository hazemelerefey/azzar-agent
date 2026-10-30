import type { Bi } from '../catalog';
import { getAgentTemplate, getDepartmentTemplate } from '../catalog';
import type { Mission, WorkbenchData, WorkbenchMode } from './types';

export type CaoNodeType = 'root' | 'cao' | 'department' | 'project' | 'agent' | 'mission' | 'group';
export type CaoRisk = 'none' | 'running' | 'needs_decision' | 'blocked';

export interface CaoNode {
  children: CaoNode[];
  /** Simulated cost, in USD, rolled up from the missions below. */
  costUsd: number;
  id: string;
  label: Bi;
  /** Worst state of this node and everything below it. */
  risk: CaoRisk;
  type: CaoNodeType;
}

const RISK_ORDER: Record<CaoRisk, number> = { blocked: 3, needs_decision: 2, none: 0, running: 1 };

const worst = (a: CaoRisk, b: CaoRisk): CaoRisk => (RISK_ORDER[a] >= RISK_ORDER[b] ? a : b);

export const missionRisk = (m: Mission): CaoRisk => {
  if (m.status === 'waiting_approval') return 'needs_decision';
  if (m.status === 'running') return 'running';
  if (m.status === 'completed' && m.blockers.some((b) => b.needsDecision)) return 'needs_decision';
  if (m.status === 'completed' && m.blockers.length > 0) return 'blocked';
  return 'none';
};

const rollUp = (node: CaoNode): CaoNode => {
  const children = node.children.map((c) => rollUp(c));
  return {
    ...node,
    children,
    costUsd: Math.round((node.costUsd + children.reduce((s, c) => s + c.costUsd, 0)) * 1000) / 1000,
    risk: children.reduce((r, c) => worst(r, c.risk), node.risk),
  };
};

const missionNode = (m: Mission): CaoNode => ({
  children: [],
  costUsd: m.costUsd,
  id: `mission:${m.id}`,
  label: { ar: m.goal, en: m.goal },
  risk: missionRisk(m),
  type: 'mission',
});

const agentNode = (templateId: string, scope: string): CaoNode => {
  const t = getAgentTemplate(templateId);
  return {
    children: [],
    costUsd: 0,
    id: `agent:${scope}:${templateId}`,
    label: t?.name ?? { ar: templateId, en: templateId },
    risk: 'none',
    type: 'agent',
  };
};

/**
 * The CAO's view of everything as a tree. Company: company, CAO, departments, projects, agents,
 * missions. Individual: you, CAO, projects, agents, missions. It is derived on every call, so it
 * never disagrees with the data it shows.
 */
export const buildCaoTree = (data: WorkbenchData, mode: WorkbenchMode): CaoNode => {
  const missionsFor = (pred: (m: Mission) => boolean) =>
    data.missions.filter((m) => pred(m)).map((m) => missionNode(m));
  const installedFor = (key: 'departmentIds' | 'projectIds', id: string) =>
    Object.values(data.installs).filter((i) => i[key].includes(id));

  const projectNode = (p: WorkbenchData['projects'][number]): CaoNode => ({
    children: [
      ...installedFor('projectIds', p.id).map((i) => agentNode(i.templateId, p.id)),
      ...missionsFor((m) => m.projectId === p.id),
    ],
    costUsd: 0,
    id: `project:${p.id}`,
    label: { ar: p.name, en: p.name },
    risk: 'none',
    type: 'project',
  });

  const cao: CaoNode = {
    children: [],
    costUsd: 0,
    id: 'cao',
    label: { ar: 'الـ CAO', en: 'CAO' },
    risk: 'none',
    type: 'cao',
  };

  if (mode === 'individual') {
    cao.children = [
      ...data.projects.map((p) => projectNode(p)),
      ...missionsFor((m) => !m.projectId),
    ];
    return rollUp({
      children: [cao],
      costUsd: 0,
      id: 'root',
      label: { ar: 'أنت', en: 'You' },
      risk: 'none',
      type: 'root',
    });
  }

  const departments = Object.values(data.departments)
    .filter((d) => d.active)
    .map((d): CaoNode => {
      const template = getDepartmentTemplate(d.templateId);
      return {
        children: [
          ...installedFor('departmentIds', d.templateId).map((i) =>
            agentNode(i.templateId, d.templateId),
          ),
          ...data.projects
            .filter((p) => p.departmentId === d.templateId)
            .map((p) => projectNode(p)),
          ...missionsFor((m) => m.departmentId === d.templateId && !m.projectId),
        ],
        costUsd: 0,
        id: `department:${d.templateId}`,
        label: d.customName ?? template?.name ?? { ar: d.templateId, en: d.templateId },
        risk: 'none',
        type: 'department',
      };
    });

  const standalone = data.projects.filter((p) => !p.departmentId).map((p) => projectNode(p));
  const unfiled = missionsFor((m) => !m.departmentId && !m.projectId);
  const standaloneGroup: CaoNode[] =
    standalone.length + unfiled.length > 0
      ? [
          {
            children: [...standalone, ...unfiled],
            costUsd: 0,
            id: 'group:standalone',
            label: { ar: 'أعمال مستقلة', en: 'Standalone work' },
            risk: 'none',
            type: 'group',
          },
        ]
      : [];

  cao.children = [...departments, ...standaloneGroup];
  return rollUp({
    children: [cao],
    costUsd: 0,
    id: 'root',
    label: { ar: 'الشركة', en: 'Company' },
    risk: 'none',
    type: 'root',
  });
};

export const countNodes = (node: CaoNode): number =>
  1 + node.children.reduce((s, c) => s + countNodes(c), 0);
