// @vitest-environment node
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { getTestDB } from '@azzar/database/test-utils';
import { sql } from 'drizzle-orm';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { MissionModel } from '@/database/models/mission';
import {
  AGENT_TEMPLATES,
  DEPARTMENT_TEMPLATES,
  getAgentTemplate,
} from '@/features/AzzarWorkbench/catalog';
import { recommendForDepartment } from '@/features/AzzarWorkbench/domain/matcher';

import { missionRouter } from '../mission';

vi.mock('@/libs/trpc/lambda/middleware', () => ({
  serverDatabase: ({ next, ctx }: any) => next({ ctx }),
}));

const db = await getTestDB();

beforeAll(async () => {
  const migrationSql = readFileSync(
    path.resolve(process.cwd(), 'packages/database/migrations/0184_azzar_workbench_phase2.sql'),
    'utf8',
  );
  for (const stmt of migrationSql
    .split('--> statement-breakpoint')
    .map((s) => s.trim())
    .filter(Boolean)) {
    await db.execute(sql.raw(stmt));
  }
});

describe('Phase 2: Departments, Marketplace Server Enforcement, My Agents PostgreSQL Persistence, and Admin CAO Auth', () => {
  it('enriches all 16 departments (8 Core + 7 Enterprise + Custom) with does, doesNot, exampleMissions, and explainable recommendations with reasons', () => {
    expect(DEPARTMENT_TEMPLATES).toHaveLength(16);
    for (const dept of DEPARTMENT_TEMPLATES) {
      expect(dept.does.length, `${dept.id} does`).toBeGreaterThan(0);
      expect(dept.doesNot.length, `${dept.id} doesNot`).toBeGreaterThan(0);
      expect(dept.exampleMissions.length, `${dept.id} exampleMissions`).toBeGreaterThan(0);

      const recs = recommendForDepartment(dept, AGENT_TEMPLATES, {});
      expect(recs.length, `${dept.id} recommendations`).toBeGreaterThan(0);
      expect(recs[0].reasons.length, `${dept.id} recommendation reasons`).toBeGreaterThan(0);
    }

    const chief = getAgentTemplate('ind-chief-of-staff')!;
    expect(chief.summary.en).not.toContain('CAO');
    expect(chief.summary.ar).not.toContain('CAO');
  });

  it('persists department activation, sources, context, instructions, and projects in PostgreSQL via missionRouter', async () => {
    const caller = missionRouter.createCaller({ serverDB: db } as any);

    const activated = await caller.activateDepartment({
      context: 'Egyptian B2B SaaS growth department',
      instructions: 'Write Egyptian Arabic copy first with English executive summary.',
      templateId: 'marketing',
      tone: 'Warm, practical Egyptian Arabic',
    });

    expect(activated.department.templateId).toBe('marketing');
    expect(activated.department.active).toBe(true);
    expect(activated.recommendations.length).toBe(5);
    expect(activated.recommendations[0].agent.id).toBe('marketing-manager');
    expect(activated.recommendations[0].reasons.length).toBeGreaterThan(0);

    const updatedDept = await caller.updateDepartment({
      sources: [
        {
          content: 'Q4 Cairo Brand Guidelines v2',
          id: 'src_brand_q4',
          kind: 'file',
          name: 'cairo-brand-guidelines.md',
          shareable: true,
        },
      ],
      templateId: 'marketing',
    });
    expect(updatedDept.sources).toHaveLength(1);
    expect(updatedDept.sources[0].kind).toBe('file');

    const project = await caller.createProject({
      context: 'Q4 Ramadan & Year-End SME Acquisition Campaign',
      departmentId: 'marketing',
      description: 'Acquisition campaign for Cairo & Alexandria SMEs',
      id: 'prj_test_phase2',
      name: 'Q4 SME Growth Launch',
    });
    expect(project.id).toBe('prj_test_phase2');
    expect(project.departmentId).toBe('marketing');
    expect(project.inherit.policies).toBe(true);

    const standaloneProject = await caller.createProject({
      context: 'Individual mode personal research project',
      departmentId: null,
      description: 'Standalone project',
      id: 'prj_standalone_phase2',
      name: 'Personal Research',
    });
    expect(standaloneProject.departmentId).toBeNull();

    const model = new MissionModel(db);
    const dbDept = await model.getDepartment('marketing');
    const dbProj = await model.getProject('prj_test_phase2');
    expect(dbDept?.context).toBe('Egyptian B2B SaaS growth department');
    expect(dbProj?.name).toBe('Q4 SME Growth Launch');
  });

  it('persists My Agents install, assign to department, assign to project, unassign, and uninstall in PostgreSQL', async () => {
    const caller = missionRouter.createCaller({ serverDB: db } as any);
    const model = new MissionModel(db);

    const installed = await caller.installAgent({
      templateId: 'marketing-manager',
    });
    expect(installed.templateId).toBe('marketing-manager');
    expect(installed.status).toBe('active');

    const assignedDept = await caller.assignAgent({
      departmentId: 'marketing',
      templateId: 'marketing-manager',
    });
    expect(assignedDept.departmentIds).toContain('marketing');

    const assignedProj = await caller.assignAgent({
      projectId: 'prj_test_phase2',
      templateId: 'marketing-manager',
    });
    expect(assignedProj.projectIds).toContain('prj_test_phase2');

    const dbRow = await model.getAgentInstall('marketing-manager');
    expect(dbRow?.departmentIdsJson).toEqual(['marketing']);
    expect(dbRow?.projectIdsJson).toEqual(['prj_test_phase2']);

    const unassigned = await caller.unassignAgent({
      projectId: 'prj_test_phase2',
      templateId: 'marketing-manager',
    });
    expect(unassigned?.projectIds).toEqual([]);

    const uninstalled = await caller.uninstallAgent({
      templateId: 'marketing-manager',
    });
    expect(uninstalled.removed).toBe(true);
    expect(await model.getAgentInstall('marketing-manager')).toBeNull();
  });

  it('refuses Coming soon agents and Coming soon departments on the server (installAgent and createAndRun)', async () => {
    const caller = missionRouter.createCaller({ serverDB: db } as any);

    await expect(caller.installAgent({ templateId: 'sales-manager' })).rejects.toThrow(
      /Refused by server: Agent "sales-manager" \(Sales Manager\) is Coming soon/,
    );

    await expect(caller.installAgent({ templateId: 'ind-chief-of-staff' })).rejects.toThrow(
      /Refused by server: Agent "ind-chief-of-staff" \(Chief of staff\) is Coming soon/,
    );

    await expect(caller.installAgent({ templateId: 'marketing-research' })).rejects.toThrow(
      /Refused by server: Specialist "marketing-research"/,
    );

    await expect(
      caller.createAndRun({
        departmentId: 'sales',
        goal: 'Try to run a sales mission',
        managerId: 'sales-manager',
      }),
    ).rejects.toThrow(/Refused by server: Agent "sales-manager" \(Sales Manager\) is Coming soon/);

    await expect(
      caller.createAndRun({
        departmentId: 'sales',
        goal: 'Try to run a mission in a coming-soon department',
      }),
    ).rejects.toThrow(/Refused by server: Department "sales" \(Sales\) is Coming soon/);

    await expect(
      caller.createAndRun({
        departmentId: 'product-engineering',
        goal: 'Try to run an enterprise coming-soon department mission',
      }),
    ).rejects.toThrow(
      /Refused by server: Department "product-engineering" \(Product and Engineering\) is Coming soon/,
    );
  });

  it('enforces server-side admin authentication and role check on getCaoTree (403 FORBIDDEN for non-admins)', async () => {
    const nonAdminCaller = missionRouter.createCaller({
      isAdmin: false,
      serverDB: db,
      userId: 'regular_user_1',
    } as any);

    await expect(nonAdminCaller.getCaoTree({ mode: 'company' })).rejects.toThrow(
      /FORBIDDEN: Server-side admin authentication and role required to access \/azzar\/cao/,
    );

    const adminCaller = missionRouter.createCaller({
      isAdmin: true,
      serverDB: db,
      userId: 'admin_user_1',
    } as any);

    const res = await adminCaller.getCaoTree({ mode: 'company' });
    expect(res.isAdmin).toBe(true);
    expect(res.tree.type).toBe('root');
  });
});
