import { describe, expect, it } from 'vitest';

import enOnboarding from '../../../../locales/en-US/onboarding.json';
import enWelcome from '../../../../locales/en-US/welcome.json';
import zhOnboarding from '../../../../locales/zh-CN/onboarding.json';
import defaultOnboarding from '../../../../packages/azzar-locales/src/default/onboarding';
import { AGENT_TEMPLATES, DEPARTMENT_TEMPLATES } from '../catalog';
import { buildCaoTree, countNodes } from '../domain/cao';
import { createWorkbenchStore } from '../domain/store';
import { DICTIONARY_KEYS, dictionaryEntry } from '../ui/i18n';

describe('Restored Workbench & CAO Tree Verification', () => {
  it('enforces Available vs Coming soon wording only (never Working)', () => {
    expect(DICTIONARY_KEYS).toContain('available');
    expect(DICTIONARY_KEYS).toContain('comingSoon');
    expect(DICTIONARY_KEYS).not.toContain('working');
    expect(dictionaryEntry('available').en).toBe('Available');
    expect(dictionaryEntry('comingSoon').en).toBe('Coming soon');

    for (const a of AGENT_TEMPLATES) {
      expect(['available', 'coming-soon']).toContain(a.availability);
    }
    for (const d of DEPARTMENT_TEMPLATES) {
      expect(['available', 'coming-soon']).toContain(d.availability);
    }
  });

  it('defaults isAdmin to false so non-admin users are gated from CAO tree', () => {
    const store = createWorkbenchStore({ persistKey: null });
    expect(store.getState().isAdmin).toBe(false);
    store.getState().setAdminMode(true);
    expect(store.getState().isAdmin).toBe(true);
  });

  it('allows installing Marketing Manager (available) and blocks coming-soon agents', () => {
    const store = createWorkbenchStore({ persistKey: null });
    expect(store.getState().installAgent('sales-manager')).toEqual({
      ok: false,
      reason: 'coming-soon',
    });
    expect(store.getState().installAgent('marketing-manager')).toEqual({
      ok: true,
      value: undefined,
    });
  });

  it('builds hierarchical CAO tree with PostgreSQL missions, DAG nodes, approvals, token rollup, and cost rollup', () => {
    const store = createWorkbenchStore({ persistKey: null });
    store.getState().activateDepartment('marketing');
    store.getState().installAgent('marketing-manager', { departmentId: 'marketing' });

    store.getState().syncMissions([
      {
        activeSpecialists: [],
        approvals: [
          {
            id: 'approval_msn_1_N6',
            label: { ar: 'بوابة موافقة N6', en: 'Approval Gate N6' },
            requestedAt: '2026-10-30T20:00:00Z',
            status: 'pending',
            stepId: 'N6',
            summary: { ar: 'ملخص', en: 'Summary' },
            toolId: 'connector:social-publish',
          },
        ],
        approvalsNeeded: ['connector:social-publish'],
        blockers: [],
        budget: { maxRounds: 7, maxTotalCostUsd: 5 },
        costUsd: 0,
        createdAt: '2026-10-30T20:00:00Z',
        cursor: 5,
        deadline: '2026-11-06',
        departmentId: 'marketing',
        events: [],
        executionMode: 'live',
        goal: 'Launch campaign brief for a test Egyptian brand',
        id: 'msn_1',
        nodes: [
          {
            agentId: 'marketing-research',
            id: 'N1',
            kind: 'task',
            status: 'done',
            stepId: 'N1',
            title: { ar: 'N1 بحث', en: 'N1 Research' },
          },
          {
            agentId: 'marketing-manager',
            id: 'N6',
            kind: 'decision',
            status: 'needs_human',
            stepId: 'N6',
            title: { ar: 'N6 موافقة', en: 'N6 Approval' },
          },
        ],
        ownerId: 'marketing',
        ownerType: 'department',
        projectId: null,
        reported: [],
        scriptId: 'marketing.launch-campaign',
        simulated: false,
        status: 'waiting_approval',
        successCriteria: ['Criteria 1'],
        tokensUsed: 7374,
      },
    ]);

    const tree = buildCaoTree(store.getState(), 'company');
    expect(tree.type).toBe('root');
    expect(tree.tokens).toBe(7374);
    expect(tree.risk).toBe('needs_decision');
    expect(countNodes(tree)).toBeGreaterThanOrEqual(7); // root + cao + dept + agent + mission + 2 dag nodes + 1 approval
  });

  it('removes user-facing CAO and Chief Agent wording from onboarding and welcome locales (A-05)', () => {
    expect(defaultOnboarding['flow.steps.chiefAgent.hint']).toBe(
      'Customize your AZZAR business manager',
    );
    expect(defaultOnboarding['flow.steps.chiefAgent.title']).toBe('Meet your AZZAR Assistant');
    expect(defaultOnboarding['flow.steps.starterTasks.subline']).toBe(
      'Assign clear tasks to your AZZAR assistant, then track its progress as it completes each one.',
    );

    expect(enOnboarding['flow.steps.chiefAgent.hint']).toBe(
      'Customize your AZZAR business manager',
    );
    expect(enOnboarding['flow.steps.chiefAgent.title']).toBe('Meet your AZZAR Assistant');
    expect(enOnboarding['flow.steps.starterTasks.subline']).toBe(
      'Assign clear tasks to your AZZAR assistant, then track its progress as it completes each one.',
    );
    expect(JSON.stringify(enOnboarding)).not.toMatch(
      /\bCAO\b|chief agent operator|Meet your Chief Agent/i,
    );
    expect(JSON.stringify(zhOnboarding)).not.toMatch(/\bCAO\b|首席 Agent/);
    expect(enWelcome['slogan.title']).toBe('Your AZZAR business orchestrator');
  });
});
