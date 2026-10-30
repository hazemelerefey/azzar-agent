import type { AgentTemplate, Bi, DepartmentTemplate } from '../catalog';
import type { InstalledAgent } from './types';

export interface Reason {
  /** The part of the department's work this agent covers. */
  does: Bi;
  tag: string;
}

export interface Recommendation {
  agent: AgentTemplate;
  cannotTouch: Bi[];
  canTouch: Bi[];
  installed: boolean;
  matchedTags: string[];
  reasons: Reason[];
  score: number;
}

/**
 * Explainable, rule-based recommendation for a department. No model call: an agent is
 * recommended when its `fits` tags match what the department does, and each reason names the
 * department's own `does` item. The manager comes first, then specialists by score.
 */
export const recommendForDepartment = (
  department: DepartmentTemplate,
  agents: AgentTemplate[],
  installs: Record<string, InstalledAgent>,
): Recommendation[] => {
  const candidates = agents.filter((a) => a.departmentId === department.id);

  const toRecommendation = (agent: AgentTemplate): Recommendation => {
    const matched = department.does.filter((item) => agent.fits.includes(item.tag));
    return {
      agent,
      cannotTouch: agent.data.cannotTouch,
      canTouch: agent.data.canTouch,
      installed: Boolean(installs[agent.id]),
      matchedTags: matched.map((m) => m.tag),
      reasons: matched.map((m) => ({ does: m.text, tag: m.tag })),
      score: matched.length,
    };
  };

  const recs = candidates.map((agent) => toRecommendation(agent));
  const order = new Map(candidates.map((a, i) => [a.id, i]));
  const rank = (r: Recommendation) => (r.agent.kind === 'manager' ? 0 : 1);

  return recs.sort(
    (a, b) =>
      rank(a) - rank(b) ||
      b.score - a.score ||
      (order.get(a.agent.id) ?? 0) - (order.get(b.agent.id) ?? 0),
  );
};
