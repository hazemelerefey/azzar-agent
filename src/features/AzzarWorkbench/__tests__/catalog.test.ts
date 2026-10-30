import { describe, expect, it } from 'vitest';

import {
  AGENT_TEMPLATES,
  CORE_DEPARTMENT_IDS,
  DEPARTMENT_TEMPLATES,
  getAgentTemplate,
  getDepartmentTemplate,
  STARTER_DEPARTMENT_IDS,
} from '../catalog';
import { buildSystemRole, toAgentCreateInput } from '../catalog/agentDefinition';
import { defaultRuleSet } from '../domain/rules';

const ctx = () => ({
  arabicDialect: 'Egyptian',
  brandVoice: 'Warm, direct',
  companyName: 'Acme',
  departmentContext: 'We sell B2B software in Egypt.',
  departmentName: 'Marketing',
  rules: defaultRuleSet(),
});

describe('catalog integrity', () => {
  it('has the 8 core departments with 36 specialists in the approved counts', () => {
    expect(CORE_DEPARTMENT_IDS).toHaveLength(8);
    const counts = Object.fromEntries(
      CORE_DEPARTMENT_IDS.map((id) => [id, getDepartmentTemplate(id)!.specialistCount]),
    );
    expect(counts).toEqual({
      'accounting-finance': 5,
      'customer-support': 4,
      'human-resources': 6,
      'information-technology': 5,
      'legal-compliance': 4,
      'marketing': 4,
      'operations': 4,
      'sales': 4,
    });
    expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(36);
  });

  it('has 15 department templates plus custom, only 8 with approved avatars', () => {
    expect(DEPARTMENT_TEMPLATES).toHaveLength(16);
    expect(DEPARTMENT_TEMPLATES.filter((d) => d.avatarKey)).toHaveLength(8);
    expect(DEPARTMENT_TEMPLATES.find((d) => d.id === 'custom')?.tier).toBe('custom');
  });

  it('every department specialist and manager id resolves to a template', () => {
    for (const id of CORE_DEPARTMENT_IDS) {
      const d = getDepartmentTemplate(id)!;
      expect(getAgentTemplate(d.managerId!), `${id} manager`).toBeDefined();
      for (const sid of d.specialistIds) expect(getAgentTemplate(sid), sid).toBeDefined();
    }
  });

  it('only the Marketing manager and its 4 specialists are available', () => {
    const available = AGENT_TEMPLATES.filter((a) => a.availability === 'available').map(
      (a) => a.id,
    );
    expect(available.sort()).toEqual(
      [
        'marketing-brand',
        'marketing-campaigns',
        'marketing-leads',
        'marketing-manager',
        'marketing-research',
      ].sort(),
    );
    expect(
      DEPARTMENT_TEMPLATES.filter((d) => d.availability === 'available').map((d) => d.id),
    ).toEqual(['marketing']);
  });

  it('every available agent has bilingual copy, tools, boundaries and a system role', () => {
    for (const a of AGENT_TEMPLATES.filter((x) => x.availability === 'available')) {
      expect(a.name.ar && a.name.en, a.id).toBeTruthy();
      expect(a.does.length, a.id).toBeGreaterThan(0);
      expect(a.doesNot.length, a.id).toBeGreaterThan(0);
      expect(a.tools.length, a.id).toBeGreaterThan(0);
      expect(a.data.canTouch.length, a.id).toBeGreaterThan(0);
      expect(a.data.cannotTouch.length, a.id).toBeGreaterThan(0);
      expect(a.systemRole, a.id).toBeTruthy();
    }
  });

  it('coming-soon agents never carry a system role or tools (nothing is claimed to work)', () => {
    for (const a of AGENT_TEMPLATES.filter((x) => x.availability === 'coming-soon')) {
      expect(a.systemRole, a.id).toBeUndefined();
      expect(a.tools, a.id).toEqual([]);
    }
  });

  it('starter tier is an offer of 5 departments', () => {
    expect(STARTER_DEPARTMENT_IDS).toHaveLength(5);
  });

  it('has 11 individual agents, all coming soon', () => {
    const ind = AGENT_TEMPLATES.filter((a) => a.kind === 'individual');
    expect(ind).toHaveLength(11);
    expect(ind.every((a) => a.availability === 'coming-soon')).toBe(true);
  });

  it('marketing manager can only spend money through a forbidden tool and publish through a tap', () => {
    const m = getAgentTemplate('marketing-manager')!;
    expect(m.tools.find((t) => t.id === 'connector:ads-spend')?.defaultLevel).toBe('forbidden');
    expect(m.tools.find((t) => t.id === 'connector:social-publish')?.defaultLevel).toBe('tap');
  });
});

describe('production agent definition', () => {
  it('fills every placeholder in the manager system role', () => {
    const role = buildSystemRole(getAgentTemplate('marketing-manager')!, ctx());
    expect(role).not.toMatch(/\{\{[A-Z_]+\}\}/);
    expect(role).toContain('Acme');
    expect(role).toContain('Research Specialist');
    expect(role).toContain('connector:social-publish): tap');
    expect(role).toContain('connector:ads-spend): forbidden');
  });

  it('fills every placeholder in each specialist system role', () => {
    for (const id of [
      'marketing-research',
      'marketing-brand',
      'marketing-campaigns',
      'marketing-leads',
    ]) {
      const role = buildSystemRole(getAgentTemplate(id)!, ctx());
      expect(role, id).not.toMatch(/\{\{[A-Z_]+\}\}/);
      expect(role, id).toContain('temporary specialist');
    }
  });

  it('refuses to build a system role for a coming-soon agent', () => {
    expect(() => buildSystemRole(getAgentTemplate('sales-manager')!, ctx())).toThrow(/coming soon/);
  });

  it('maps Rules to runtime approval modes and drops forbidden tools', () => {
    const input = toAgentCreateInput(
      getAgentTemplate('marketing-manager')!,
      ctx(),
      '/azzar/avatars/dark/03-marketing-dark.svg',
    );
    expect(input.toolApproval['connector:social-publish']).toBe('manual');
    expect(input.toolApproval['connector:crm-write']).toBe('allow-list');
    expect(input.toolApproval['azzar-web-browsing/search']).toBe('auto-run');
    expect(input.toolApproval['connector:ads-spend']).toBeUndefined();
    expect(input.plugins).toContain('azzar-web-browsing');
    expect(input.plugins.some((p) => p.startsWith('connector'))).toBe(false);
    expect(input.model).toBeNull();
    expect(input.slug).toBe('azzar-marketing-manager');
  });

  it('uses the locked model when the department Rules lock one', () => {
    const c = ctx();
    c.rules.model = { lock: true, modelId: 'some-model' };
    expect(toAgentCreateInput(getAgentTemplate('marketing-manager')!, c, '/a.svg').model).toBe(
      'some-model',
    );
  });
});

describe('copy audit (bilingual completeness)', () => {
  const hasArabic = (s: string) => /\p{Script=Arabic}/u.test(s);
  it('every catalog string has non-empty Arabic with Arabic letters and non-empty English', () => {
    const bad: string[] = [];
    const check = (where: string, b: { ar: string; en: string }) => {
      if (!b.en?.trim() || !b.ar?.trim() || !hasArabic(b.ar)) bad.push(where);
    };
    for (const a of AGENT_TEMPLATES) {
      check(`${a.id}.name`, a.name);
      check(`${a.id}.role`, a.role);
      check(`${a.id}.summary`, a.summary);
      a.does.forEach((x, i) => check(`${a.id}.does[${i}]`, x));
      a.doesNot.forEach((x, i) => check(`${a.id}.doesNot[${i}]`, x));
      a.tools.forEach((t) => check(`${a.id}.tool.${t.id}`, t.label));
    }
    for (const d of DEPARTMENT_TEMPLATES) {
      check(`${d.id}.name`, d.name);
      check(`${d.id}.mission`, d.mission);
      d.does.forEach((x, i) => check(`${d.id}.does[${i}]`, x.text));
      d.doesNot.forEach((x, i) => check(`${d.id}.doesNot[${i}]`, x));
    }
    expect(bad).toEqual([]);
  });

  it('every UI dictionary entry is bilingual', async () => {
    const { DICTIONARY_KEYS, dictionaryEntry } = await import('../ui/i18n');
    const bad = DICTIONARY_KEYS.filter((k) => {
      const e = dictionaryEntry(k);
      return !e.en.trim() || !e.ar.trim() || !hasArabic(e.ar);
    });
    expect(bad).toEqual([]);
  });
});

describe('source audit (generic, data-driven)', () => {
  it('no logic or page file names a specific department; only catalog, runner scripts and tests do', async () => {
    const { readdirSync, readFileSync, statSync } = await import('node:fs');
    const { join, relative } = await import('node:path');
    const root = join(__dirname, '..');
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        if (statSync(full).isDirectory()) walk(full);
        else if (/\.tsx?$/.test(name)) files.push(full);
      }
    };
    walk(root);
    const offenders = files
      .map((f) => relative(root, f))
      .filter((f) => !/^(?:catalog|runner|__tests__)[/\\]/.test(f))
      .filter((f) => /marketing/i.test(readFileSync(join(root, f), 'utf8')));
    expect(offenders).toEqual([]);
  });

  it('nothing in the workbench reads or stores a key, token or secret', async () => {
    const { readdirSync, readFileSync, statSync } = await import('node:fs');
    const { join } = await import('node:path');
    const root = join(__dirname, '..');
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        if (statSync(full).isDirectory()) {
          if (name !== '__tests__') walk(full);
        } else if (
          /\.tsx?$/.test(name) &&
          /api[_-]?key|secret|password|bearer/i.test(readFileSync(full, 'utf8'))
        ) {
          hits.push(full);
        }
      }
    };
    walk(root);
    expect(hits).toEqual([]);
  });
});
