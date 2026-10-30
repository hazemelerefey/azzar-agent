import { describe, expect, it } from 'vitest';

import { DEPARTMENT_TEMPLATES, getAgentTemplate, getDepartmentTemplate } from '../catalog';
import { buildBriefing } from '../domain/briefing';
import { buildCaoTree, countNodes } from '../domain/cao';
import { recommendForDepartment } from '../domain/matcher';
import {
  departmentMemoryForProject,
  effectiveProjectContext,
  visibleMemory,
} from '../domain/memory';
import { defaultRuleSet, effectiveLevel, missionLevel, setToolLevel } from '../domain/rules';
import { createWorkbenchStore } from '../domain/store';

const fixedStore = () => {
  let n = 0;
  let t = 0;
  return createWorkbenchStore({
    id: (p) => `${p}_${++n}`,
    now: () => new Date(Date.UTC(2026, 9, 31, 9, 0, t++)).toISOString(),
    persistKey: null,
  });
};

/** Company mode, Marketing active, manager installed and assigned, a project, ready to launch. */
const setup = () => {
  const store = fixedStore();
  const s = store.getState();
  s.setMode('company');
  s.activateDepartment('marketing');
  s.installAgent('marketing-manager', { departmentId: 'marketing' });
  const project = store
    .getState()
    .createProject({ departmentId: 'marketing', description: '', name: 'Q4 launch' });
  if (!project.ok) throw new Error('project');
  store.getState().assignAgent('marketing-manager', { projectId: project.value.id });
  return { project: project.value, store };
};

const launch = (
  store: ReturnType<typeof fixedStore>,
  projectId?: string,
  scriptId = 'marketing.launch-campaign',
) =>
  store.getState().launchMission({
    approvalsNeeded: [],
    deadline: '2026-11-15',
    goal: 'Launch the Nile Pay app',
    ownerId: projectId ?? 'marketing',
    ownerType: projectId ? 'project' : 'department',
    scriptId,
    successCriteria: ['Campaign plan ready'],
  });

const runAll = (store: ReturnType<typeof fixedStore>, id: string, limit = 60) => {
  for (let i = 0; i < limit; i++) {
    const m = store.getState().missions.find((x) => x.id === id)!;
    if (m.status !== 'running') break;
    store.getState().advance(id);
  }
  return store.getState().missions.find((x) => x.id === id)!;
};

describe('rules', () => {
  const tool = getAgentTemplate('marketing-manager')!.tools.find(
    (t) => t.id === 'connector:social-publish',
  )!;

  it('uses the template default, then the department override', () => {
    const rules = defaultRuleSet();
    expect(effectiveLevel(rules, tool, 'manager')).toBe('tap');
    const loosened = setToolLevel(rules, tool.id, 'report', tool.defaultLevel);
    expect(effectiveLevel(loosened, tool, 'manager')).toBe('report');
  });

  it('stores overrides only, and removes one when set back to the default', () => {
    const r1 = setToolLevel(defaultRuleSet(), tool.id, 'forbidden', tool.defaultLevel);
    expect(r1.toolLevels).toEqual({ [tool.id]: 'forbidden' });
    expect(setToolLevel(r1, tool.id, 'tap', tool.defaultLevel).toolLevels).toEqual({});
  });

  it('forbids outward actions for specialists by default (the manager gates them)', () => {
    expect(effectiveLevel(defaultRuleSet(), tool, 'specialist')).toBe('forbidden');
  });

  it('lets a mission owner only make a tool stricter', () => {
    const rules = setToolLevel(defaultRuleSet(), tool.id, 'alone', tool.defaultLevel);
    expect(missionLevel(rules, tool, 'manager', { approvalsNeeded: [tool.id] })).toBe('tap');
    const ads = getAgentTemplate('marketing-manager')!.tools.find(
      (t) => t.id === 'connector:ads-spend',
    )!;
    expect(missionLevel(defaultRuleSet(), ads, 'manager', { approvalsNeeded: [ads.id] })).toBe(
      'forbidden',
    );
  });
});

describe('matcher', () => {
  it('puts the manager first, with a reason for each match, and flags coming soon', () => {
    const recs = recommendForDepartment(getDepartmentTemplate('marketing')!, getAllAgents(), {});
    expect(recs[0].agent.id).toBe('marketing-manager');
    expect(recs[0].reasons.length).toBe(6);
    expect(
      recs
        .slice(1)
        .map((r) => r.agent.id)
        .sort(),
    ).toEqual(['marketing-brand', 'marketing-campaigns', 'marketing-leads', 'marketing-research']);
    for (const r of recs) expect(r.reasons.length).toBeGreaterThan(0);
  });

  it('recommends coming-soon agents for other core departments, nothing for extras', () => {
    const sales = recommendForDepartment(getDepartmentTemplate('sales')!, getAllAgents(), {});
    expect(sales).toHaveLength(5);
    expect(sales.every((r) => r.agent.availability === 'coming-soon')).toBe(true);
    const extra = DEPARTMENT_TEMPLATES.find((d) => d.id === 'security')!;
    expect(recommendForDepartment(extra, getAllAgents(), {})).toEqual([]);
  });
});

function getAllAgents() {
  return DEPARTMENT_TEMPLATES.flatMap((d) =>
    [d.managerId, ...d.specialistIds].filter(Boolean).map((id) => getAgentTemplate(id!)!),
  );
}

describe('store: install, assign, launch gating', () => {
  it('installs only working non-specialist agents', () => {
    const store = fixedStore();
    expect(store.getState().installAgent('sales-manager')).toEqual({
      ok: false,
      reason: 'coming-soon',
    });
    expect(store.getState().installAgent('marketing-research')).toEqual({
      ok: false,
      reason: 'specialist-not-installable',
    });
    expect(store.getState().installAgent('marketing-manager').ok).toBe(true);
  });

  it('cannot launch a mission before the manager is installed and assigned', () => {
    const store = fixedStore();
    store.getState().setMode('company');
    store.getState().activateDepartment('marketing');
    expect(launch(store)).toEqual({ ok: false, reason: 'agent-not-installed' });
    store.getState().installAgent('marketing-manager');
    expect(launch(store)).toEqual({ ok: false, reason: 'agent-not-assigned' });
    store.getState().assignAgent('marketing-manager', { departmentId: 'marketing' });
    expect(launch(store).ok).toBe(true);
  });

  it('cannot launch in a coming-soon department or an inactive one', () => {
    const store = fixedStore();
    store.getState().setMode('company');
    store.getState().activateDepartment('sales');
    expect(
      store.getState().launchMission({
        approvalsNeeded: [],
        deadline: '2026-11-15',
        goal: 'x',
        ownerId: 'sales',
        ownerType: 'department',
        scriptId: 'marketing.launch-campaign',
        successCriteria: ['y'],
      }),
    ).toEqual({ ok: false, reason: 'coming-soon' });
    store.getState().deactivateDepartment('sales');
    expect(launch(store).ok).toBe(false);
  });

  it('allows one agent in several departments and projects, and keeps data on deactivate', () => {
    const { project, store } = setup();
    store.getState().activateDepartment('sales');
    store.getState().assignAgent('marketing-manager', { departmentId: 'sales' });
    const inst = store.getState().installs['marketing-manager'];
    expect(inst.departmentIds).toEqual(['marketing', 'sales']);
    expect(inst.projectIds).toEqual([project.id]);
    store.getState().deactivateDepartment('marketing');
    expect(store.getState().departments.marketing.templateId).toBe('marketing');
    expect(store.getState().departments.marketing.active).toBe(false);
  });

  it('validates the mission form: goal, criteria and deadline are required', () => {
    const { store } = setup();
    const bad = store.getState().launchMission({
      approvalsNeeded: [],
      deadline: '',
      goal: ' ',
      ownerId: 'marketing',
      ownerType: 'department',
      scriptId: 'marketing.launch-campaign',
      successCriteria: [''],
    });
    expect(bad).toEqual({ ok: false, reason: 'invalid-input' });
  });

  it('department projects default to private and inherit department defaults', () => {
    const { project } = setup();
    expect(project.visibility).toBe('private');
    expect(project.inherit).toEqual({ policies: true, sources: false, tone: true });
  });
});

describe('simulated runner: full Marketing flow', () => {
  it('pauses at the publish approval, then completes after a tap', () => {
    const { project, store } = setup();
    const res = launch(store, project.id);
    if (!res.ok) throw new Error('launch');
    const id = res.value.id;

    const paused = runAll(store, id);
    expect(paused.status).toBe('waiting_approval');
    expect(paused.approvals).toHaveLength(1);
    expect(paused.approvals[0].toolId).toBe('connector:social-publish');
    expect(paused.simulated).toBe(true);
    // Campaigns specialist is still alive while the approval waits; others were closed.
    expect(paused.activeSpecialists).toEqual(['marketing-campaigns']);

    store.getState().resolveApproval(id, paused.approvals[0].id, 'approved');
    const done = runAll(store, id);
    expect(done.status).toBe('completed');
    expect(done.activeSpecialists).toEqual([]);
    expect(done.report?.outcome.en).toContain('approved and published (simulated)');
    // Ads spend is forbidden by default: a decision-needed blocker, never executed.
    expect(done.blockers.filter((b) => b.needsDecision).map((b) => b.stepId)).toEqual([
      'action-ads',
    ]);
    expect(done.events.some((e) => e.toolId === 'connector:ads-spend' && e.type === 'action')).toBe(
      false,
    );
    // CRM write is "report": it ran alone and is listed for the briefing.
    expect(done.reported.map((r) => r.toolId)).toEqual(['connector:crm-write']);
  });

  it('spawns and closes each specialist exactly once, in order', () => {
    const { project, store } = setup();
    const res = launch(store, project.id);
    if (!res.ok) throw new Error('launch');
    let m = runAll(store, res.value.id);
    store.getState().resolveApproval(res.value.id, m.approvals[0].id, 'approved');
    m = runAll(store, res.value.id);
    const spawned = m.events.filter((e) => e.type === 'spawn').map((e) => e.agentId);
    const closed = m.events.filter((e) => e.type === 'close').map((e) => e.agentId);
    expect(spawned).toEqual([
      'marketing-research',
      'marketing-brand',
      'marketing-campaigns',
      'marketing-leads',
    ]);
    expect(closed).toEqual(spawned);
  });

  it('a refused approval leaves the post unpublished and records a blocker', () => {
    const { project, store } = setup();
    const res = launch(store, project.id);
    if (!res.ok) throw new Error('launch');
    let m = runAll(store, res.value.id);
    store.getState().resolveApproval(res.value.id, m.approvals[0].id, 'rejected');
    m = runAll(store, res.value.id);
    expect(m.status).toBe('completed');
    expect(m.approvals[0].status).toBe('rejected');
    expect(m.report?.outcome.en).toContain('Nothing has been published');
    expect(
      m.events.some((e) => e.toolId === 'connector:social-publish' && e.type === 'action'),
    ).toBe(false);
  });

  it('changing the Rule changes behaviour on the next run (report: no pause)', () => {
    const { project, store } = setup();
    const tool = getAgentTemplate('marketing-manager')!.tools.find(
      (t) => t.id === 'connector:social-publish',
    )!;
    const rules = store.getState().departments.marketing.rules;
    store
      .getState()
      .setDepartmentRules('marketing', setToolLevel(rules, tool.id, 'report', tool.defaultLevel));
    const res = launch(store, project.id);
    if (!res.ok) throw new Error('launch');
    const m = runAll(store, res.value.id);
    expect(m.status).toBe('completed');
    expect(m.approvals).toHaveLength(0);
    expect(m.reported.map((r) => r.toolId).sort()).toEqual([
      'connector:crm-write',
      'connector:social-publish',
    ]);
  });

  it('forbidding publish removes the approval and records a decision-needed blocker', () => {
    const { project, store } = setup();
    const tool = getAgentTemplate('marketing-manager')!.tools.find(
      (t) => t.id === 'connector:social-publish',
    )!;
    const rules = store.getState().departments.marketing.rules;
    store
      .getState()
      .setDepartmentRules(
        'marketing',
        setToolLevel(rules, tool.id, 'forbidden', tool.defaultLevel),
      );
    const res = launch(store, project.id);
    if (!res.ok) throw new Error('launch');
    const m = runAll(store, res.value.id);
    expect(m.status).toBe('completed');
    expect(m.blockers.map((b) => b.stepId).sort()).toEqual(['action-ads', 'action-publish']);
  });

  it('the owner can add an approval on top of the Rules', () => {
    const { project, store } = setup();
    const res = store.getState().launchMission({
      approvalsNeeded: ['connector:crm-write'],
      deadline: '2026-11-15',
      goal: 'g',
      ownerId: project.id,
      ownerType: 'project',
      scriptId: 'marketing.launch-campaign',
      successCriteria: ['c'],
    });
    if (!res.ok) throw new Error('launch');
    let m = runAll(store, res.value.id);
    store.getState().resolveApproval(res.value.id, m.approvals[0].id, 'approved');
    m = runAll(store, res.value.id);
    expect(m.status).toBe('waiting_approval');
    expect(m.approvals.map((a) => a.toolId)).toEqual([
      'connector:social-publish',
      'connector:crm-write',
    ]);
  });

  it('the competitor brief needs no approvals', () => {
    const { project, store } = setup();
    const res = launch(store, project.id, 'marketing.competitor-brief');
    if (!res.ok) throw new Error('launch');
    const m = runAll(store, res.value.id);
    expect(m.status).toBe('completed');
    expect(m.approvals).toHaveLength(0);
  });

  it('does not advance a paused or finished mission, and accrues only simulated cost', () => {
    const { project, store } = setup();
    const res = launch(store, project.id);
    if (!res.ok) throw new Error('launch');
    const paused = runAll(store, res.value.id);
    const before = JSON.stringify(paused);
    store.getState().advance(res.value.id);
    expect(JSON.stringify(store.getState().missions[0])).toBe(before);
    expect(paused.costUsd).toBeGreaterThan(0);
    expect(paused.costUsd).toBeLessThan(paused.budget.maxTotalCostUsd);
  });

  it('cancelling closes all specialists', () => {
    const { project, store } = setup();
    const res = launch(store, project.id);
    if (!res.ok) throw new Error('launch');
    runAll(store, res.value.id);
    store.getState().cancelMission(res.value.id);
    const m = store.getState().missions[0];
    expect(m.status).toBe('cancelled');
    expect(m.activeSpecialists).toEqual([]);
  });
});

describe('memory hierarchy', () => {
  const complete = () => {
    const { project, store } = setup();
    const res = launch(store, project.id);
    if (!res.ok) throw new Error('launch');
    const paused = runAll(store, res.value.id);
    store.getState().resolveApproval(res.value.id, paused.approvals[0].id, 'approved');
    runAll(store, res.value.id);
    return { missionId: res.value.id, project, store };
  };

  it('summarises a finished mission up to the project and the department, not to global by default', () => {
    const { store } = complete();
    const layers = store
      .getState()
      .memory.map((m) => m.layer)
      .sort();
    expect(layers).toEqual(['department', 'mission', 'project']);
  });

  it('digests to global only when the Rule allows it', () => {
    const { project, store } = setup();
    const rules = store.getState().departments.marketing.rules;
    store
      .getState()
      .setDepartmentRules('marketing', {
        ...rules,
        memory: { digestToDepartment: false, digestToGlobal: true },
      });
    const res = launch(store, project.id, 'marketing.competitor-brief');
    if (!res.ok) throw new Error('launch');
    runAll(store, res.value.id);
    expect(
      store
        .getState()
        .memory.map((m) => m.layer)
        .sort(),
    ).toEqual(['global', 'mission', 'project']);
  });

  it('isolates departments: another department never sees Marketing memory', () => {
    const { store } = complete();
    const data = store.getState();
    expect(
      visibleMemory(data, { departmentId: 'sales' }).filter((m) => m.layer !== 'global'),
    ).toEqual([]);
    expect(
      visibleMemory(data, { departmentId: 'marketing' }).some((m) => m.layer === 'department'),
    ).toBe(true);
  });

  it('isolates projects: a project sees only its own memory', () => {
    const { project, store } = complete();
    const other = store
      .getState()
      .createProject({ departmentId: 'marketing', description: '', name: 'Other' });
    if (!other.ok) throw new Error('project');
    const mine = visibleMemory(store.getState(), {
      departmentId: 'marketing',
      projectId: project.id,
    });
    const theirs = visibleMemory(store.getState(), {
      departmentId: 'marketing',
      projectId: other.value.id,
    });
    expect(mine.some((m) => m.layer === 'project')).toBe(true);
    expect(theirs.some((m) => m.layer === 'project')).toBe(false);
  });

  it('a project inherits department history only when an entry is marked shareable', () => {
    const { store } = complete();
    expect(departmentMemoryForProject(store.getState(), 'marketing')).toEqual([]);
  });

  it('inheritance is opt-in per field, and sources only when shareable', () => {
    const dept = {
      context: 'We sell to SMEs.',
      instructions: 'Never promise delivery dates.',
      sources: [
        { id: '1', kind: 'note' as const, name: 'Public', shareable: true },
        { id: '2', kind: 'note' as const, name: 'Private', shareable: false },
      ],
      tone: 'Warm and direct',
    };
    const all = effectiveProjectContext(
      { inherit: { policies: true, sources: true, tone: true } },
      dept,
    );
    expect(all.sources.map((s) => s.name)).toEqual(['Public']);
    expect(all.tone).toBe('Warm and direct');
    expect(all.policies).toContain('Never promise delivery dates.');
    const none = effectiveProjectContext(
      { inherit: { policies: false, sources: false, tone: false } },
      dept,
    );
    expect(none).toEqual({ policies: '', sources: [], tone: '' });
  });
});

describe('CAO tree and briefing', () => {
  it('builds company > CAO > department > project > agent and mission with roll-up', () => {
    const { project, store } = setup();
    const res = launch(store, project.id);
    if (!res.ok) throw new Error('launch');
    runAll(store, res.value.id);
    const tree = buildCaoTree(store.getState(), 'company');
    expect(tree.type).toBe('root');
    const cao = tree.children[0];
    const marketing = cao.children.find((c) => c.id === 'department:marketing')!;
    const proj = marketing.children.find((c) => c.type === 'project')!;
    expect(proj.children.some((c) => c.type === 'mission')).toBe(true);
    expect(proj.children.some((c) => c.type === 'agent')).toBe(true);
    // Waiting for approval rolls up to the root as needs_decision.
    expect(tree.risk).toBe('needs_decision');
    expect(tree.costUsd).toBeGreaterThan(0);
    expect(countNodes(tree)).toBeGreaterThan(5);
  });

  it('individual tree has no departments', () => {
    const store = fixedStore();
    store.getState().setMode('individual');
    store.getState().installAgent('marketing-manager');
    const p = store
      .getState()
      .createProject({ departmentId: null, description: '', name: 'Side business' });
    if (!p.ok) throw new Error('project');
    store.getState().assignAgent('marketing-manager', { projectId: p.value.id });
    const tree = buildCaoTree(store.getState(), 'individual');
    expect(tree.label.en).toBe('You');
    expect(JSON.stringify(tree)).not.toContain('department:');
  });

  it('standalone projects appear under a Standalone work group in company mode', () => {
    const { store } = setup();
    store
      .getState()
      .createProject({ departmentId: null, description: '', name: 'Cross-department' });
    const tree = buildCaoTree(store.getState(), 'company');
    expect(tree.children[0].children.some((c) => c.id === 'group:standalone')).toBe(true);
  });

  it('one company briefing with department sections; needs-decision items are listed', () => {
    const { project, store } = setup();
    const res = launch(store, project.id);
    if (!res.ok) throw new Error('launch');
    const paused = runAll(store, res.value.id);
    let b = buildBriefing(store.getState(), 'company', '2026-10-31T10:00:00.000Z');
    expect(b.sections.map((s) => s.departmentId)).toEqual(['marketing']);
    expect(b.needsDecisionCount).toBe(1);
    store.getState().resolveApproval(res.value.id, paused.approvals[0].id, 'approved');
    runAll(store, res.value.id);
    b = buildBriefing(store.getState(), 'company', '2026-10-31T10:00:00.000Z');
    expect(b.sections[0].completed).toHaveLength(1);
    expect(b.sections[0].reported.map((r) => r.action.toolId)).toEqual(['connector:crm-write']);
    // Ads spend is forbidden: one decision for a person remains.
    expect(b.needsDecisionCount).toBe(1);
  });

  it('individual briefing is a single personal section', () => {
    const store = fixedStore();
    store.getState().setMode('individual');
    expect(
      buildBriefing(store.getState(), 'individual', '2026-10-31T10:00:00.000Z').sections,
    ).toEqual([]);
  });
});
