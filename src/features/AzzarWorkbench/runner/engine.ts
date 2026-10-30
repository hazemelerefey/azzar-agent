import type { Bi, ToolGrant } from '../catalog';
import { missionLevel } from '../domain/rules';
import type {
  GraphNode,
  Mission,
  NodeStatus,
  OwnerType,
  RuleRole,
  RuleSet,
  RunEvent,
  RunEventType,
} from '../domain/types';
import type { MissionScript, ScriptStep } from './types';

/**
 * Simulated mission runner.
 *
 * It is a pure state machine: no timers, no network, no model. It advances one script step per
 * call and writes the same shapes a real run will write (graph nodes like `goal_nodes`, events,
 * approvals, blockers). Every mission it produces is marked `simulated: true`.
 */

export interface EngineContext {
  now: string;
  rules: RuleSet;
  script: MissionScript;
  /** The manager's tool grants by id. The Rules gate these. */
  tools: Record<string, ToolGrant>;
}

export interface NewMissionInput {
  approvalsNeeded: string[];
  budget?: { maxRounds: number; maxTotalCostUsd: number };
  deadline: string;
  departmentId: string | null;
  executionMode?: 'live' | 'simulated';
  goal: string;
  id: string;
  modelId?: string;
  now: string;
  ownerId: string;
  ownerType: OwnerType;
  projectId: string | null;
  scriptId: string;
  simulated?: boolean;
  successCriteria: string[];
}

export const interpolate = (text: Bi, goal: string): Bi => ({
  ar: text.ar.split('{{goal}}').join(goal),
  en: text.en.split('{{goal}}').join(goal),
});

export const createMission = (input: NewMissionInput): Mission => {
  const goal = input.goal.trim();
  if (!goal) throw new Error('A mission needs a goal.');
  if (input.successCriteria.filter((c) => c.trim()).length === 0) {
    throw new Error('A mission needs at least one success criterion.');
  }
  const isLive = input.executionMode === 'live';
  return {
    activeSpecialists: [],
    approvals: [],
    approvalsNeeded: input.approvalsNeeded,
    blockers: [],
    budget: input.budget ?? { maxRounds: 8, maxTotalCostUsd: 5 },
    cursor: 0,
    costUsd: 0,
    createdAt: input.now,
    deadline: input.deadline,
    departmentId: input.departmentId,
    events: [],
    executionMode: input.executionMode ?? (input.simulated === false ? 'live' : 'simulated'),
    goal,
    id: input.id,
    modelId: input.modelId ?? 'qwen2.5:7b',
    nodes: [],
    ownerId: input.ownerId,
    ownerType: input.ownerType,
    projectId: input.projectId,
    reported: [],
    scriptId: input.scriptId,
    simulated: input.executionMode ? !isLive : (input.simulated ?? true),
    status: 'running',
    successCriteria: input.successCriteria.filter((c) => c.trim()),
  };
};

const nodeId = (m: Mission, stepId: string) => `${m.id}:node:${stepId}`;

const roleOf = (script: MissionScript, actor: string): RuleRole =>
  actor === script.managerId ? 'manager' : 'specialist';

const withEvent = (
  m: Mission,
  type: RunEventType,
  agentId: string,
  text: Bi,
  now: string,
  toolId?: string,
): Mission => {
  const event: RunEvent = {
    agentId,
    at: now,
    id: `${m.id}:ev:${m.events.length}`,
    text,
    ...(toolId ? { toolId } : {}),
    type,
  };
  return { ...m, events: [...m.events, event] };
};

const upsertNode = (m: Mission, node: GraphNode): Mission => {
  const exists = m.nodes.some((n) => n.id === node.id);
  return {
    ...m,
    nodes: exists ? m.nodes.map((n) => (n.id === node.id ? node : n)) : [...m.nodes, node],
  };
};

const setNodeStatus = (m: Mission, id: string, status: NodeStatus): Mission => ({
  ...m,
  nodes: m.nodes.map((n) => (n.id === id ? { ...n, status } : n)),
});

const rootNodeId = (m: Mission, script: MissionScript) => nodeId(m, script.steps[0].id);

const parentOf = (m: Mission, script: MissionScript, step: ScriptStep): string | undefined => {
  if (step.id === script.steps[0].id) return undefined;
  return step.parentStep ? nodeId(m, step.parentStep) : rootNodeId(m, script);
};

const addNode = (
  m: Mission,
  script: MissionScript,
  step: ScriptStep,
  status: NodeStatus,
  title: Bi,
  output?: Bi,
): Mission =>
  upsertNode(m, {
    agentId: step.actor,
    id: nodeId(m, step.id),
    kind: step.nodeKind ?? 'task',
    ...(output ? { output } : {}),
    parentId: parentOf(m, script, step),
    status,
    stepId: step.id,
    title,
  });

const addCost = (m: Mission, step: ScriptStep): Mission => ({
  ...m,
  costUsd: Math.round((m.costUsd + step.costUsd) * 1000) / 1000,
});

/** Runs the action of an `action` step as if the tool had executed (simulated). */
const executeAction = (
  m: Mission,
  script: MissionScript,
  step: ScriptStep,
  now: string,
  reportIt: boolean,
): Mission => {
  const goal = m.goal;
  const out = step.output ? interpolate(step.output, goal) : interpolate(step.title, goal);
  let next = addNode(m, script, step, 'done', interpolate(step.title, goal), out);
  next = withEvent(next, 'action', step.actor, out, now, step.toolId);
  if (reportIt && step.toolId) {
    next = {
      ...next,
      reported: [
        ...next.reported,
        { id: `${m.id}:rp:${step.id}`, stepId: step.id, text: out, toolId: step.toolId },
      ],
    };
  }
  return addCost(next, step);
};

const finishIfLast = (m: Mission, script: MissionScript): Mission =>
  m.cursor >= script.steps.length ? { ...m, status: 'completed' } : m;

/** Advances a running mission by one script step. No-op unless the mission is running. */
export const advanceMission = (mission: Mission, ctx: EngineContext): Mission => {
  if (mission.status !== 'running') return mission;
  const { script, now } = ctx;
  const step = script.steps[mission.cursor];
  if (!step) return finishIfLast(mission, script);
  const goal = mission.goal;
  const title = interpolate(step.title, goal);
  const detail = step.detail ? interpolate(step.detail, goal) : title;
  let m = mission;

  switch (step.kind) {
    case 'plan': {
      m = addNode(m, script, step, 'done', title, detail);
      m = withEvent(m, 'plan', step.actor, detail, now);
      break;
    }
    case 'spawn': {
      m = addNode(m, script, step, 'running', title, detail);
      m = {
        ...m,
        activeSpecialists: m.activeSpecialists.includes(step.actor)
          ? m.activeSpecialists
          : [...m.activeSpecialists, step.actor],
      };
      m = withEvent(m, 'spawn', step.actor, detail, now);
      break;
    }
    case 'work': {
      const out = step.output ? interpolate(step.output, goal) : detail;
      m = addNode(m, script, { ...step, nodeKind: step.nodeKind ?? 'finding' }, 'done', title, out);
      m = withEvent(m, 'work', step.actor, out, now);
      break;
    }
    case 'verify': {
      m = addNode(m, script, { ...step, nodeKind: 'decision' }, 'done', title, detail);
      m = withEvent(m, 'verify', step.actor, detail, now);
      break;
    }
    case 'close': {
      const spawnNode = step.parentStep ? nodeId(m, step.parentStep) : undefined;
      if (spawnNode) m = setNodeStatus(m, spawnNode, 'done');
      m = { ...m, activeSpecialists: m.activeSpecialists.filter((id) => id !== step.actor) };
      m = withEvent(m, 'close', step.actor, detail, now);
      break;
    }
    case 'action': {
      const tool = step.toolId ? ctx.tools[step.toolId] : undefined;
      if (!tool) {
        // A script that names a tool the manager does not have is a catalog error: stop safely.
        m = addNode(
          m,
          script,
          { ...step, nodeKind: 'decision' },
          'blocked',
          title,
          step.blockedText,
        );
        m = withEvent(m, 'blocked', step.actor, step.blockedText ?? title, now, step.toolId);
        m = {
          ...m,
          blockers: [
            ...m.blockers,
            {
              id: `${m.id}:bl:${step.id}`,
              needsDecision: true,
              stepId: step.id,
              text: step.blockedText ?? title,
            },
          ],
        };
        break;
      }
      const level = missionLevel(ctx.rules, tool, roleOf(script, step.actor), m);
      if (level === 'forbidden') {
        const text = interpolate(step.blockedText ?? step.title, goal);
        m = addNode(m, script, { ...step, nodeKind: 'decision' }, 'needs_human', title, text);
        m = withEvent(m, 'blocked', step.actor, text, now, step.toolId);
        m = {
          ...m,
          blockers: [
            ...m.blockers,
            { id: `${m.id}:bl:${step.id}`, needsDecision: true, stepId: step.id, text },
          ],
        };
      } else if (level === 'tap') {
        const summary = interpolate(step.approvalSummary ?? step.title, goal);
        const label = interpolate(step.actionLabel ?? step.title, goal);
        m = addNode(m, script, step, 'needs_human', title, summary);
        m = withEvent(m, 'approval_requested', step.actor, summary, now, step.toolId);
        return {
          ...m,
          approvals: [
            ...m.approvals,
            {
              id: `${m.id}:ap:${step.id}`,
              label,
              requestedAt: now,
              status: 'pending',
              stepId: step.id,
              summary,
              toolId: step.toolId ?? '',
            },
          ],
          // The cursor stays on this step until a person decides.
          status: 'waiting_approval',
        };
      } else {
        m = executeAction(m, script, step, now, level === 'report');
        // Account for the cost added in executeAction, then move on below.
        m = { ...m, cursor: m.cursor + 1 };
        return finishIfLast(m, script);
      }
      break;
    }
    case 'report': {
      m = addNode(m, script, step, 'done', title, detail);
      m = addCost(m, step);
      const completed: Mission = {
        ...m,
        completedAt: now,
        cursor: m.cursor + 1,
        status: 'completed',
      };
      const report = script.buildReport(completed);
      let done: Mission = { ...completed, report };
      done = withEvent(done, 'report', step.actor, report.outcome, now);
      done = withEvent(
        done,
        'completed',
        step.actor,
        { ar: 'اكتملت المهمة', en: 'Mission completed' },
        now,
      );
      return done;
    }
    default: {
      break;
    }
  }

  if (step.kind !== 'action') m = addCost(m, step);
  m = { ...m, cursor: m.cursor + 1 };
  return finishIfLast(m, script);
};

/** A person approves or refuses the pending approval. The mission continues either way. */
export const resolveApproval = (
  mission: Mission,
  approvalId: string,
  decision: 'approved' | 'rejected',
  ctx: EngineContext,
): Mission => {
  const approval = mission.approvals.find((a) => a.id === approvalId && a.status === 'pending');
  if (!approval || mission.status !== 'waiting_approval') return mission;
  const step = ctx.script.steps.find((s) => s.id === approval.stepId);
  if (!step) return mission;
  const { now } = ctx;
  let m: Mission = {
    ...mission,
    approvals: mission.approvals.map((a) =>
      a.id === approvalId ? { ...a, resolvedAt: now, status: decision } : a,
    ),
  };
  const verdict: Bi =
    decision === 'approved'
      ? { ar: `تمت الموافقة: ${approval.label.ar}`, en: `Approved: ${approval.label.en}` }
      : { ar: `تم الرفض: ${approval.label.ar}`, en: `Refused: ${approval.label.en}` };
  m = withEvent(m, 'approval_resolved', 'human', verdict, now, step.toolId);

  if (decision === 'approved') {
    m = executeAction(m, ctx.script, step, now, false);
  } else {
    const text = interpolate(
      step.rejectedText ?? {
        ar: `لم يتم تنفيذ: ${approval.label.ar}`,
        en: `Not done: ${approval.label.en}`,
      },
      m.goal,
    );
    m = setNodeStatus(m, nodeId(m, step.id), 'blocked');
    m = withEvent(m, 'blocked', step.actor, text, now, step.toolId);
    m = {
      ...m,
      blockers: [
        ...m.blockers,
        { id: `${m.id}:bl:${step.id}`, needsDecision: false, stepId: step.id, text },
      ],
    };
  }
  m = { ...m, cursor: m.cursor + 1, status: 'running' };
  return finishIfLast(m, ctx.script);
};

export const cancelMission = (mission: Mission, now: string): Mission => {
  if (mission.status === 'completed' || mission.status === 'cancelled') return mission;
  const m = withEvent(
    mission,
    'cancelled',
    'human',
    { ar: 'أُلغيت المهمة', en: 'Mission cancelled' },
    now,
  );
  return { ...m, activeSpecialists: [], completedAt: now, status: 'cancelled' };
};

/** Runs a mission to its next pause or to the end. Used by tests and the "run to end" button. */
export const runUntilPause = (mission: Mission, ctx: EngineContext, maxSteps = 100): Mission => {
  let m = mission;
  for (let i = 0; i < maxSteps && m.status === 'running'; i++) m = advanceMission(m, ctx);
  return m;
};

export const hasExecutedAction = (mission: Mission, toolId: string): boolean =>
  mission.events.some((e) => e.type === 'action' && e.toolId === toolId);
