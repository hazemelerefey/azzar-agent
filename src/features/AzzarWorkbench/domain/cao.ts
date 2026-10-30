import type { Bi } from '../catalog';
import { getAgentTemplate, getDepartmentTemplate } from '../catalog';
import type { Mission, WorkbenchData, WorkbenchMode } from './types';

export type CaoNodeType =
  | 'root'
  | 'cao'
  | 'department'
  | 'project'
  | 'agent'
  | 'mission'
  | 'dag_node'
  | 'approval_gate'
  | 'group';
export type CaoRisk = 'none' | 'running' | 'needs_decision' | 'blocked';

export interface CaoNode {
  children: CaoNode[];
  /** Actual cost in USD rolled up from PostgreSQL missions below. */
  costUsd: number;
  id: string;
  label: Bi;
  meta?: string;
  /** Worst state of this node and everything below it. */
  risk: CaoRisk;
  /** Total tokens rolled up from PostgreSQL mission checkpoints below. */
  tokens: number;
  type: CaoNodeType;
}

const RISK_ORDER: Record<CaoRisk, number> = { blocked: 3, needs_decision: 2, none: 0, running: 1 };

const worst = (a: CaoRisk, b: CaoRisk): CaoRisk => (RISK_ORDER[a] >= RISK_ORDER[b] ? a : b);

export const missionRisk = (m: Mission): CaoRisk => {
  if (m.status === 'waiting_approval') return 'needs_decision';
  if (m.status === 'running') return 'running';
  if (m.status === 'cancelled') return 'blocked';
  if (m.status === 'completed' && m.blockers.some((b) => b.needsDecision)) return 'needs_decision';
  if (m.status === 'completed' && m.blockers.length > 0) return 'blocked';
  return 'none';
};

const rollUp = (node: CaoNode): CaoNode => {
  const children = node.children.map((c) => rollUp(c));
  return {
    ...node,
    children,
    costUsd:
      Math.round((node.costUsd + children.reduce((s, c) => s + c.costUsd, 0)) * 1000) / 1000,
    risk: children.reduce((r, c) => worst(r, c.risk), node.risk),
    tokens: node.tokens + children.reduce((s, c) => s + c.tokens, 0),
  };
};

const missionNode = (m: Mission): CaoNode => {
  const dagChildren: CaoNode[] = (m.nodes || []).map((n: any) => ({
    children: [],
    costUsd: 0,
    id: `dag:${m.id}:${n.id}`,
    label: n.title || { ar: n.id, en: n.id },
    meta: `${n.kind || 'node'} · ${n.status}`,
    risk:
      n.status === 'waiting_approval'
        ? ('needs_decision' as const)
        : n.status === 'running'
          ? ('running' as const)
          : n.status === 'blocked'
            ? ('blocked' as const)
            : ('none' as const),
    tokens: 0,
    type: 'dag_node' as const,
  }));

  const approvalChildren: CaoNode[] = (m.approvals || []).map((a: any) => ({
    children: [],
    costUsd: 0,
    id: `approval:${m.id}:${a.id}`,
    label: a.label || { ar: a.id, en: a.id },
    meta: `approval · ${a.status}`,
    risk:
      a.status === 'pending'
        ? ('needs_decision' as const)
        : a.status === 'rejected'
          ? ('blocked' as const)
          : ('none' as const),
    tokens: 0,
    type: 'approval_gate' as const,
  }));

  return {
    children: [...dagChildren, ...approvalChildren],
    costUsd: m.costUsd || 0,
    id: `mission:${m.id}`,
    label: { ar: m.goal, en: m.goal },
    meta: `${m.id} · ${m.status}`,
    risk: missionRisk(m),
    tokens: m.tokensUsed || 0,
    type: 'mission',
  };
};

const agentNode = (templateId: string, scope: string): CaoNode => {
  const t = getAgentTemplate(templateId);
  return {
    children: [],
    costUsd: 0,
    id: `agent:${scope}:${templateId}`,
    label: t?.name ?? { ar: templateId, en: templateId },
    meta: t?.kind ?? 'agent',
    risk: 'none',
    tokens: 0,
    type: 'agent',
  };
};

/**
 * The CAO's view of everything as a hierarchical tree:
 * Company -> CAO -> Active Departments -> Installed Agents / Projects / PostgreSQL Missions -> DAG Nodes & Approval Gates.
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
    meta: p.visibility,
    risk: 'none',
    tokens: 0,
    type: 'project',
  });

  const cao: CaoNode = {
    children: [],
    costUsd: 0,
    id: 'cao',
    label: { ar: 'أذّار (AZZAR Orchestrator)', en: 'AZZAR Orchestrator (CAO)' },
    meta: 'Chief Agent Orchestrator',
    risk: 'none',
    tokens: 0,
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
      tokens: 0,
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
        meta: d.templateId,
        risk: 'none',
        tokens: 0,
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
            tokens: 0,
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
    tokens: 0,
    type: 'root',
  });
};

export const countNodes = (node: CaoNode): number =>
  1 + node.children.reduce((s, c) => s + countNodes(c), 0);
