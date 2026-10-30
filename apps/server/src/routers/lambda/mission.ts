import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import {
  AGENT_TEMPLATES,
  getAgentTemplate,
  getDepartmentTemplate,
  getMissionTemplate,
} from '@/features/AzzarWorkbench/catalog';
import { buildCaoTree } from '@/features/AzzarWorkbench/domain/cao';
import { recommendForDepartment } from '@/features/AzzarWorkbench/domain/matcher';
import { defaultRuleSet } from '@/features/AzzarWorkbench/domain/rules';
import type {
  ActiveDepartment,
  InstalledAgent,
  Project,
  WorkbenchData,
} from '@/features/AzzarWorkbench/domain/types';
import { MissionModel } from '@/database/models/mission';
import { users } from '@/database/schemas/user';
import { publicProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { MissionEngine } from '@/server/services/missionEngine/engine';
import { MissionJournalManager } from '@/server/services/missionEngine/journal';
import {
  MARKETING_MISSION_DAG,
  MarketingMissionExecutor,
} from '@/server/services/missionEngine/marketingMission';
import type {
  MissionDAGDef,
  MissionOrgContext,
  MissionReceipt,
} from '@/server/services/missionEngine/types';

const missionProcedure = publicProcedure.use(serverDatabase);

const NODE_META: Record<
  string,
  {
    agentId: string;
    kind: 'plan' | 'work' | 'check' | 'approval' | 'report';
    parentId: string | null;
    title: { ar: string; en: string };
  }
> = {
  N1: {
    agentId: 'marketing-research',
    kind: 'work',
    parentId: null,
    title: { ar: 'N1 · بحث السوق والمنافسين (Research)', en: 'N1 · Market & Competitor Research' },
  },
  N2: {
    agentId: 'marketing-brand',
    kind: 'work',
    parentId: null,
    title: { ar: 'N2 · تدقيق الهوية التجارية (Brand Audit)', en: 'N2 · Brand & Voice Audit' },
  },
  N3: {
    agentId: 'marketing-campaigns',
    kind: 'work',
    parentId: 'N1',
    title: {
      ar: 'N3 · مسودة الحملة الإعلانية بالعامية المصرية',
      en: 'N3 · Campaign Draft (Egyptian Arabic + EN)',
    },
  },
  N4: {
    agentId: 'marketing-leads',
    kind: 'work',
    parentId: 'N3',
    title: {
      ar: 'N4 · قائمة العملاء المحتملين التجريبية (SAMPLE)',
      en: 'N4 · Sample Leads List (SAMPLE)',
    },
  },
  N5: {
    agentId: 'marketing-manager',
    kind: 'check',
    parentId: 'N4',
    title: {
      ar: 'N5 · فحص حواجز الأمان ومراجعة مدير التسويق',
      en: 'N5 · Deterministic Guardrail & Manager Check',
    },
  },
  N6: {
    agentId: 'marketing-manager',
    kind: 'approval',
    parentId: 'N5',
    title: {
      ar: 'N6 · بوابة موافقة الإنسان (Approval Gate)',
      en: 'N6 · Human Approval Gate (Single-Consume)',
    },
  },
  N7: {
    agentId: 'marketing-manager',
    kind: 'report',
    parentId: 'N6',
    title: {
      ar: 'N7 · كتابة الموجز النهائي وإيصال التحقق',
      en: 'N7 · Final Brief Artifact & Verification Receipt',
    },
  },
};

function summarizeNodeOutput(nodeId: string, output: any): { ar: string; en: string } | undefined {
  if (!output) return undefined;
  if (nodeId === 'N1') {
    const summaryAr = output.specialistSummaryAr || '';
    const count = Array.isArray(output.findings) ? output.findings.length : 0;
    return {
      ar: summaryAr || `تم استخراج ${count} نتائج بحث موثقة بالمصادر.`,
      en: `${count} verified research findings collected with live HTTP citations. ${summaryAr}`,
    };
  }
  if (nodeId === 'N2') {
    const pos = output.positioningAr || '';
    const count = Array.isArray(output.brandFacts) ? output.brandFacts.length : 0;
    return {
      ar: pos || `تم تدقيق ${count} حقائق للهوية التجارية.`,
      en: `Audited ${count} brand facts from DESIGN.md & AGENTS.md. ${pos}`,
    };
  }
  if (nodeId === 'N3') {
    return {
      ar: `${output.messageAr || ''} — (${(output.channels || []).join('، ')})`,
      en: `${output.englishSummary || output.messageAr || ''}`,
    };
  }
  if (nodeId === 'N4') {
    const rows = Array.isArray(output.rows) ? output.rows.length : 0;
    return {
      ar: `${rows} صفوف عملاء محتملين تجريبية موسومة بـ SAMPLE بالكامل.`,
      en: `${rows} sample lead rows generated — all explicitly flagged sample: true & label: "SAMPLE".`,
    };
  }
  if (nodeId === 'N5') {
    return {
      ar:
        output.managerReviewAr ||
        (output.overallPass ? 'اجتازت المسودة جميع فحوصات الأمان الستة.' : 'توقف عند فحص الحواجز.'),
      en: `Guardrail overallPass=${Boolean(output.overallPass)} (retries: ${output.retryCount ?? 0}). ${output.managerReviewAr || ''}`,
    };
  }
  if (nodeId === 'N6') {
    return {
      ar: 'بوابة موافقة محمية بتجزئة SHA-256 وتُستهلك ذرياً لمرة واحدة.',
      en: 'Durable approval gate protected by SHA-256 payload hash and atomic single-use consumption.',
    };
  }
  if (nodeId === 'N7') {
    return {
      ar: `تم حفظ الموجز النهائي (${output.bytesWritten ?? 0} بايت) — SHA-256: ${output.artifactHash || ''}`,
      en: `Final brief written to ${output.artifactPath || ''} (${output.bytesWritten ?? 0} bytes, SHA-256: ${output.artifactHash || ''}).`,
    };
  }
  const text = typeof output === 'string' ? output : JSON.stringify(output);
  return { ar: text, en: text };
}

async function buildFullMissionDetail(missionModel: MissionModel, missionId: string) {
  const dbMission = await missionModel.getMission(missionId);
  if (!dbMission) return null;

  const [dbNodes, dbApprovals, checkpoint, journal, receiptRow] = await Promise.all([
    missionModel.getNodes(missionId),
    missionModel.getApprovals(missionId),
    missionModel.getLatestCheckpoint(missionId),
    missionModel.getJournal(missionId),
    missionModel.getReceipt(missionId),
  ]);

  const stateJson = (checkpoint?.snapshotJson || {}) as Record<string, any>;
  const committedToolResults = (stateJson.committedToolResults || {}) as Record<string, any>;
  const tokenRollup = stateJson.tokenRollup || {
    completionTokens: 0,
    promptTokens: 0,
    totalTokens: 0,
  };
  const costUsd = typeof stateJson.cost === 'number' ? stateJson.cost : 0;

  const nodeOutputs: Record<string, any> = {};
  for (const [k, v] of Object.entries(committedToolResults)) {
    if (k.startsWith('__nodeOutput_')) {
      nodeOutputs[k.replace('__nodeOutput_', '')] = v;
    }
  }

  // Also check approval shownPayload for N3, N4, N5 if needed
  const latestApproval = dbApprovals.at(-1);
  if (latestApproval?.shownPayload && typeof latestApproval.shownPayload === 'object') {
    const sp = latestApproval.shownPayload as Record<string, any>;
    if (sp.campaignDraft && !nodeOutputs.N3) nodeOutputs.N3 = sp.campaignDraft;
    if (sp.sampleLeads && !nodeOutputs.N4) nodeOutputs.N4 = sp.sampleLeads;
    if (sp.guardrailCheck && !nodeOutputs.N5) nodeOutputs.N5 = sp.guardrailCheck;
  }

  const sortedNodes = [...dbNodes].sort((a, b) => a.nodeId.localeCompare(b.nodeId));
  const receipt = (receiptRow?.receiptJson as MissionReceipt | undefined) ?? null;

  // Map status to Workbench Mission status
  const wbStatus =
    dbMission.status === 'paused'
      ? ('waiting_approval' as const)
      : dbMission.status === 'completed'
        ? ('completed' as const)
        : dbMission.status === 'rejected' ||
            dbMission.status === 'failed' ||
            dbMission.status === 'cancelled'
          ? ('cancelled' as const)
          : ('running' as const);

  const mappedApprovals = dbApprovals.map((a) => ({
    createdAt: a.createdAt.toISOString(),
    decidedAt: a.decidedAt ? a.decidedAt.toISOString() : undefined,
    id: a.id,
    label: {
      ar: `طلب موافقة على العقدة ${a.nodeId} (SHA-256: ${a.shownPayloadHash.slice(0, 12)}…)`,
      en: `Approval Gate at ${a.nodeId} (SHA-256: ${a.shownPayloadHash.slice(0, 12)}…)`,
    },
    nodeId: a.nodeId,
    status: (a.decision === 'approved'
      ? 'approved'
      : a.decision === 'rejected'
        ? 'rejected'
        : 'pending') as 'pending' | 'approved' | 'rejected',
    summary: {
      ar:
        nodeOutputs.N3?.messageAr ||
        'مراجعة مسودة الحملة الإعلانية وفحص حواجز الأمان قبل كتابة الموجز النهائي.',
      en:
        nodeOutputs.N3?.englishSummary ||
        'Review campaign draft, sample leads, and guardrail check before writing final brief.',
    },
    toolId: a.toolId || 'connector:social-publish',
  }));

  const mappedNodes = sortedNodes.map((n) => {
    const meta = NODE_META[n.nodeId] || {
      agentId: 'marketing-manager',
      kind: 'work' as const,
      parentId: null,
      title: { ar: n.nodeId, en: n.nodeId },
    };
    const st =
      n.status === 'completed'
        ? ('done' as const)
        : n.status === 'running'
          ? ('running' as const)
          : n.status === 'failed'
            ? ('blocked' as const)
            : dbMission.status === 'paused' && n.nodeId === 'N6'
              ? ('waiting_approval' as const)
              : ('queued' as const);

    return {
      agentId: meta.agentId,
      id: n.nodeId,
      kind: meta.kind,
      output: summarizeNodeOutput(n.nodeId, nodeOutputs[n.nodeId]),
      parentId: meta.parentId,
      status: st,
      title: meta.title,
    };
  });

  const activeSpecialists = mappedNodes.filter((n) => n.status === 'running').map((n) => n.agentId);

  const mappedEvents = journal.map((j) => {
    const p = (j.payloadJson || {}) as Record<string, any>;
    const evType =
      j.eventType === 'tool_call' || j.eventType === 'tool_result'
        ? ('tool_used' as const)
        : j.eventType === 'approval_decision'
          ? p.decision === 'approved'
            ? ('approval_granted' as const)
            : ('approval_rejected' as const)
          : j.eventType === 'model_block'
            ? ('node_done' as const)
            : ('node_started' as const);

    const descText =
      j.eventType === 'tool_call'
        ? `Tool Call: ${p.toolId || p.toolCallId}`
        : j.eventType === 'tool_result'
          ? `Tool Result: ${p.toolCallId} (${(p.sources || []).join(', ')})`
          : j.eventType === 'model_block'
            ? `LLM [${p.provider}/${p.model}] @ ${p.nodeId} (${p.tokens ?? 0} tokens)`
            : j.eventType === 'approval_decision'
              ? `Approval ${p.decision} by ${p.decidedBy || 'Human'} ${p.consumedAt ? `(consumed @ ${p.consumedAt})` : ''}`
              : `Node ${p.nodeId || ''} → ${p.status || j.eventType}`;

    return {
      agentId: NODE_META[p.nodeId || '']?.agentId || 'marketing-manager',
      at: j.createdAt.toISOString(),
      id: j.id,
      text: { ar: descText, en: descText },
      type: evType,
    };
  });

  const n7Out = nodeOutputs.N7;
  const workbenchMission = {
    activeSpecialists,
    approvals: mappedApprovals,
    approvalsNeeded: ['connector:social-publish'],
    blockers:
      dbMission.status === 'rejected'
        ? [
            {
              id: `blk_${missionId}`,
              needsDecision: false,
              text: {
                ar: 'تم رفض الموافقة عند العقدة N6 وتوقفت المهمة دون تشغيل N7.',
                en: 'Approval rejected at N6; mission terminated cleanly without running N7.',
              },
            },
          ]
        : [],
    budget: { maxSteps: 7, maxTotalCostUsd: 5 },
    completedAt: dbMission.status === 'completed' ? dbMission.updatedAt.toISOString() : undefined,
    costUsd,
    createdAt: dbMission.createdAt.toISOString(),
    cursor: sortedNodes.filter((n) => n.status === 'completed').length,
    deadline: new Date(dbMission.createdAt.getTime() + 7 * 86_400_000).toISOString().slice(0, 10),
    departmentId: dbMission.departmentId || 'marketing',
    events: mappedEvents,
    executionMode: 'live' as const,
    goal: dbMission.title,
    id: dbMission.id,
    isGenerating: dbMission.status === 'running',
    managerId: 'marketing-manager',
    modelId: receipt?.modelDisclosure?.model || 'gemma4:e4b',
    nodes: mappedNodes,
    ownerId: dbMission.projectId || dbMission.departmentId || 'marketing',
    ownerType: (dbMission.projectId ? 'project' : 'department') as 'department' | 'project',
    projectId: dbMission.projectId ?? null,
    report:
      dbMission.status === 'completed'
        ? {
            blockers: [],
            decisions: [],
            done: [
              {
                ar: 'بحث السوق والمنافسين (N1) وتدقيق الهوية التجارية (N2) بالتوازي (سقف التوازي = ٢)',
                en: 'Market research (N1) & Brand audit (N2) executed in parallel (concurrency cap = 2)',
              },
              {
                ar: 'مسودة الحملة بالعامية المصرية (N3) وقائمة ٥ عملاء محتملين تجريبية SAMPLE (N4)',
                en: 'Egyptian Arabic campaign draft (N3) & 5-row SAMPLE leads list (N4)',
              },
              {
                ar: 'فحص الحواجز الحتمي (N5) واستهلاك موافقة الإنسان لمرة واحدة (N6) وكتابة الموجز النهائي (N7)',
                en: 'Deterministic guardrail check (N5), single-consume approval (N6), and final brief artifact (N7)',
              },
            ],
            evidence: [
              {
                ar: `ملف الموجز: ${n7Out?.artifactPath || `artifacts/azzar-marketing-brief-${missionId}.md`}`,
                en: `Brief Artifact: ${n7Out?.artifactPath || `artifacts/azzar-marketing-brief-${missionId}.md`}`,
              },
              {
                ar: `بصمة SHA-256 للموجز: ${n7Out?.artifactHash || ''}`,
                en: `Brief SHA-256: ${n7Out?.artifactHash || ''}`,
              },
              {
                ar: `إجمالي الرموز (Tokens): ${tokenRollup.totalTokens} (${receipt?.modelDisclosure?.provider || 'ollama'}/${receipt?.modelDisclosure?.model || 'gemma4:e4b'})`,
                en: `Total Tokens: ${tokenRollup.totalTokens} (${receipt?.modelDisclosure?.provider || 'ollama'}/${receipt?.modelDisclosure?.model || 'gemma4:e4b'})`,
              },
            ],
            next: {
              ar: 'مراجعة الموجز النهائي المعتمد والبدء في جدولة النشر.',
              en: 'Review the approved final brief artifact and schedule campaign publishing.',
            },
            outcome: {
              ar: nodeOutputs.N3?.messageAr || dbMission.title,
              en: nodeOutputs.N3?.englishSummary || dbMission.title,
            },
          }
        : null,
    reported: Object.values(committedToolResults)
      .filter((tc: any) => Boolean(tc?.toolCallId))
      .map((tc: any) => ({
        agentId: 'marketing-manager',
        at: dbMission.updatedAt.toISOString(),
        id: tc.toolCallId,
        text: {
          ar: `أداة حقيقية منفذة: ${tc.toolId} (${(tc.sources || []).join(', ')})`,
          en: `Executed real tool: ${tc.toolId} (${(tc.sources || []).join(', ')})`,
        },
        toolId: tc.toolId,
      })),
    scriptId: 'marketing.launch-campaign',
    simulated: false as const,
    status: wbStatus,
    stepsUsed: sortedNodes.filter((n) => n.status === 'completed').length,
    successCriteria: [
      'Market & competitor research backed by sources',
      'Egyptian Arabic campaign draft + 5 SAMPLE leads',
      'Deterministic guardrail pass + single-consume N6 approval + N7 brief artifact',
    ],
    tokensUsed: tokenRollup.totalTokens,
  };

  return {
    engineState: {
      approvals: dbApprovals.map((a) => ({
        ...a,
        consumedAt: a.consumedAt ? a.consumedAt.toISOString() : null,
        createdAt: a.createdAt.toISOString(),
        decidedAt: a.decidedAt ? a.decidedAt.toISOString() : null,
        updatedAt: a.updatedAt.toISOString(),
      })),
      checkpoint: checkpoint
        ? {
            createdAt: checkpoint.createdAt.toISOString(),
            id: checkpoint.id,
            missionId: checkpoint.missionId,
            stateJson: checkpoint.snapshotJson,
          }
        : null,
      journal: journal.map((j) => ({
        createdAt: j.createdAt.toISOString(),
        eventType: j.eventType,
        id: j.id,
        missionId: j.missionId,
        payload: j.payloadJson,
        sourceEventId: j.sourceEventId,
      })),
      mission: {
        ...dbMission,
        createdAt: dbMission.createdAt.toISOString(),
        updatedAt: dbMission.updatedAt.toISOString(),
      },
      nodeOutputs,
      nodes: sortedNodes.map((n) => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
        output: nodeOutputs[n.nodeId] ?? null,
        updatedAt: n.updatedAt.toISOString(),
      })),
      receipt,
      tokenRollup,
    },
    workbenchMission,
  };
}

function mapDbDepartment(row: any): ActiveDepartment {
  const rulesObj =
    row.rulesJson && typeof row.rulesJson === 'object' && Object.keys(row.rulesJson).length > 0
      ? row.rulesJson
      : defaultRuleSet();
  return {
    activatedAt: row.activatedAt ? new Date(row.activatedAt).toISOString() : new Date().toISOString(),
    active: Boolean(row.active),
    context: row.context || '',
    customName: row.customNameJson || undefined,
    instructions: row.instructions || '',
    rules: rulesObj,
    sources: Array.isArray(row.sourcesJson) ? row.sourcesJson : [],
    templateId: row.templateId,
    tone: row.tone || '',
  };
}

function mapDbProject(row: any): Project {
  return {
    context: row.context || '',
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
    departmentId: row.departmentId ?? null,
    description: row.description || '',
    id: row.id,
    inherit:
      row.inheritJson && typeof row.inheritJson === 'object'
        ? row.inheritJson
        : { policies: true, sources: false, tone: true },
    name: row.name,
    sources: Array.isArray(row.sourcesJson) ? row.sourcesJson : [],
    visibility: row.visibility === 'shared' ? 'shared' : 'private',
  };
}

function mapDbInstall(row: any): InstalledAgent {
  return {
    departmentIds: Array.isArray(row.departmentIdsJson) ? row.departmentIdsJson : [],
    installedAt: row.installedAt ? new Date(row.installedAt).toISOString() : new Date().toISOString(),
    projectIds: Array.isArray(row.projectIdsJson) ? row.projectIdsJson : [],
    status: row.status === 'paused' ? 'paused' : 'active',
    templateId: row.templateId,
  };
}

async function resolveOrgContext(
  missionModel: MissionModel,
  departmentId?: string | null,
  projectId?: string | null,
): Promise<MissionOrgContext | undefined> {
  const deptRow = departmentId ? await missionModel.getDepartment(departmentId) : null;
  const projRow = projectId ? await missionModel.getProject(projectId) : null;
  if (!deptRow && !projRow) return undefined;

  const deptTpl = departmentId ? getDepartmentTemplate(departmentId) : undefined;
  const customName = (deptRow?.customNameJson as { ar?: string; en?: string } | undefined)?.en;
  const inherit = (projRow?.inheritJson as { policies?: boolean; sources?: boolean; tone?: boolean }) || {
    policies: true,
    sources: false,
    tone: true,
  };

  return {
    departmentContext: deptRow?.context || undefined,
    departmentId: departmentId ?? projRow?.departmentId ?? null,
    departmentInstructions:
      !projRow || inherit.policies !== false ? deptRow?.instructions || undefined : undefined,
    departmentName: customName || deptTpl?.name.en || departmentId || undefined,
    departmentSources:
      !projRow || inherit.sources
        ? Array.isArray(deptRow?.sourcesJson)
          ? (deptRow.sourcesJson as any[])
          : undefined
        : undefined,
    departmentTone: !projRow || inherit.tone !== false ? deptRow?.tone || undefined : undefined,
    projectContext: projRow?.context || undefined,
    projectDescription: projRow?.description || undefined,
    projectId: projRow?.id ?? projectId ?? null,
    projectName: projRow?.name || undefined,
    projectSources: Array.isArray(projRow?.sourcesJson) ? (projRow.sourcesJson as any[]) : undefined,
  };
}

async function resolveServerAdmin(ctx: any): Promise<boolean> {
  if (ctx?.isAdmin === true) return true;
  const adminIdsEnv = (process.env.AZZAR_ADMIN_USER_IDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (ctx?.userId && adminIdsEnv.includes(ctx.userId)) {
    return true;
  }
  if (ctx?.userId && ctx?.serverDB) {
    try {
      const rows = await ctx.serverDB
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, ctx.userId))
        .limit(1);
      if (rows[0]?.role === 'admin') return true;
    } catch {
      // Fallback if users table query fails
    }
  }
  return false;
}

async function buildPostgreSQLWorkbenchState(
  missionModel: MissionModel,
  ctx: any,
): Promise<{
  departments: Record<string, ActiveDepartment>;
  installs: Record<string, InstalledAgent>;
  isAdmin: boolean;
  projects: Project[];
}> {
  const [deptRows, projRows, installRows, isAdmin] = await Promise.all([
    missionModel.listDepartments(),
    missionModel.listProjects(),
    missionModel.listAgentInstalls(),
    resolveServerAdmin(ctx),
  ]);

  const departments: Record<string, ActiveDepartment> = {};
  for (const r of deptRows) {
    departments[r.templateId] = mapDbDepartment(r);
  }

  const installs: Record<string, InstalledAgent> = {};
  for (const r of installRows) {
    installs[r.templateId] = mapDbInstall(r);
  }

  const projects = projRows.map(mapDbProject);
  return { departments, installs, isAdmin, projects };
}

export const missionRouter = router({
  activateDepartment: missionProcedure
    .input(
      z.object({
        context: z.string().optional(),
        customName: z.object({ ar: z.string(), en: z.string() }).optional(),
        instructions: z.string().optional(),
        templateId: z.string().min(1),
        tone: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const isCustom = input.templateId === 'custom' || input.templateId.startsWith('custom-');
      const template = getDepartmentTemplate(isCustom ? 'custom' : input.templateId);
      if (!template) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Department template "${input.templateId}" not found.`,
        });
      }

      const missionModel = new MissionModel(ctx.serverDB);
      const row = await missionModel.upsertDepartment({
        activatedAt: new Date(),
        active: true,
        context: input.context ?? '',
        customNameJson: input.customName ?? undefined,
        instructions: input.instructions ?? '',
        rulesJson: defaultRuleSet(),
        sourcesJson: [],
        templateId: input.templateId,
        tone: input.tone ?? '',
      });

      const installRows = await missionModel.listAgentInstalls();
      const installsMap: Record<string, InstalledAgent> = {};
      for (const r of installRows) installsMap[r.templateId] = mapDbInstall(r);

      const recommendations = recommendForDepartment(template, AGENT_TEMPLATES, installsMap);
      return {
        department: mapDbDepartment(row),
        recommendations,
      };
    }),

  assignAgent: missionProcedure
    .input(
      z.object({
        departmentId: z.string().optional(),
        projectId: z.string().optional(),
        templateId: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const missionModel = new MissionModel(ctx.serverDB);
      const existing = await missionModel.getAgentInstall(input.templateId);
      if (!existing) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: `Agent "${input.templateId}" is not installed in My Agents.`,
        });
      }
      if (input.departmentId) {
        const dept = await missionModel.getDepartment(input.departmentId);
        if (!dept || !dept.active) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: `Department "${input.departmentId}" is not active in PostgreSQL.`,
          });
        }
      }
      if (input.projectId) {
        const proj = await missionModel.getProject(input.projectId);
        if (!proj) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Project "${input.projectId}" not found in PostgreSQL.`,
          });
        }
      }
      const updated = await missionModel.assignAgent(input.templateId, {
        departmentId: input.departmentId,
        projectId: input.projectId,
      });
      return mapDbInstall(updated);
    }),

  cancel: missionProcedure
    .input(z.object({ missionId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const missionModel = new MissionModel(ctx.serverDB);
      const journalManager = new MissionJournalManager(missionModel);
      await missionModel.updateStatus(input.missionId, 'cancelled');
      await journalManager.appendEvent({
        eventType: 'node_status_change',
        missionId: input.missionId,
        payload: { status: 'cancelled' },
      });
      return buildFullMissionDetail(missionModel, input.missionId);
    }),

  createAndRun: missionProcedure
    .input(
      z.object({
        agentId: z.string().optional(),
        departmentId: z.string().optional(),
        goal: z.string().min(1),
        managerId: z.string().optional(),
        mode: z.enum(['company', 'individual']).optional(),
        modelId: z.string().optional(),
        projectId: z.string().nullable().optional(),
        scriptId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const missionModel = new MissionModel(ctx.serverDB);

      // 1. Server-side enforcement of Available vs Coming soon for agent/manager, script, and department
      const requestedAgentId = input.managerId || input.agentId;
      if (requestedAgentId) {
        const agentTpl = getAgentTemplate(requestedAgentId);
        if (!agentTpl) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Refused by server: Agent "${requestedAgentId}" does not exist in catalog.`,
          });
        }
        if (agentTpl.availability !== 'available') {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: `Refused by server: Agent "${requestedAgentId}" (${agentTpl.name.en}) is Coming soon and cannot create or run missions. Only Marketing Manager (marketing-manager) is Available.`,
          });
        }
      }

      if (input.scriptId) {
        const scriptTpl = getMissionTemplate(input.scriptId);
        if (!scriptTpl) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: `Refused by server: Mission script "${input.scriptId}" is not available. Only Marketing scripts are Available.`,
          });
        }
      }

      const targetDeptId = input.departmentId || 'marketing';
      const isCustomDept = targetDeptId === 'custom' || targetDeptId.startsWith('custom-');
      if (!isCustomDept) {
        const deptTpl = getDepartmentTemplate(targetDeptId);
        if (!deptTpl) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Refused by server: Department "${targetDeptId}" not found.`,
          });
        }
        if (deptTpl.availability !== 'available') {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: `Refused by server: Department "${targetDeptId}" (${deptTpl.name.en}) is Coming soon and cannot create or run missions. Only Marketing is Available.`,
          });
        }
      }

      // 2. Verify project & My Agents installation/assignment in PostgreSQL when projectId or installs exist
      if (input.projectId) {
        const proj = await missionModel.getProject(input.projectId);
        if (!proj) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Refused by server: Project "${input.projectId}" not found in PostgreSQL.`,
          });
        }
        const installRow = await missionModel.getAgentInstall('marketing-manager');
        if (!installRow || installRow.status !== 'active') {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message:
              'Refused by server: Marketing Manager (marketing-manager) must be installed and active in My Agents (PostgreSQL) before launching a project mission.',
          });
        }
        const deptIds = Array.isArray(installRow.departmentIdsJson)
          ? (installRow.departmentIdsJson as string[])
          : [];
        const projIds = Array.isArray(installRow.projectIdsJson)
          ? (installRow.projectIdsJson as string[])
          : [];
        if (!projIds.includes(input.projectId) && !deptIds.includes(targetDeptId)) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: `Refused by server: Marketing Manager (marketing-manager) is not assigned to department "${targetDeptId}" or project "${input.projectId}" in PostgreSQL.`,
          });
        }
      }

      try {
        const engine = new MissionEngine(missionModel);
        const journalManager = new MissionJournalManager(missionModel);
        const missionId = `mission_${Date.now()}`;
        const orgContext = await resolveOrgContext(missionModel, targetDeptId, input.projectId);

        const dagDef: MissionDAGDef = {
          ...MARKETING_MISSION_DAG,
          departmentId: targetDeptId,
          id: missionId,
          mode: input.mode || 'company',
          orgContext,
          projectId: input.projectId ?? null,
          title: input.goal.trim(),
        };

        await engine.createMission(dagDef);
        const executor = new MarketingMissionExecutor(
          missionId,
          process.cwd(),
          journalManager,
          undefined,
          orgContext,
        );
        const runResult = await engine.runMission(missionId, executor, { concurrencyCap: 2 });
        const detail = await buildFullMissionDetail(missionModel, missionId);

        return { detail, missionId, orgContext, runResult };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          cause: error,
          code: 'INTERNAL_SERVER_ERROR',
          message: error?.message || 'Failed to create and run mission',
        });
      }
    }),

  createProject: missionProcedure
    .input(
      z.object({
        context: z.string().optional(),
        departmentId: z.string().nullable().optional(),
        description: z.string().default(''),
        id: z.string().optional(),
        name: z.string().min(1),
        visibility: z.enum(['private', 'shared']).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const missionModel = new MissionModel(ctx.serverDB);
      const deptId = input.departmentId ?? null;
      let inherit = { policies: false, sources: false, tone: false };
      if (deptId) {
        const dept = await missionModel.getDepartment(deptId);
        if (!dept || !dept.active) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: `Department "${deptId}" must be activated in PostgreSQL before creating a project inside it.`,
          });
        }
        const rules = (dept.rulesJson as any) || defaultRuleSet();
        inherit = rules.inherit || { policies: true, sources: false, tone: true };
      }

      const id = input.id || `prj_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
      const row = await missionModel.createProject({
        context: input.context ?? '',
        departmentId: deptId,
        description: input.description.trim(),
        id,
        inheritJson: inherit,
        name: input.name.trim(),
        sourcesJson: [],
        visibility: input.visibility ?? 'private',
      });
      return mapDbProject(row);
    }),

  deactivateDepartment: missionProcedure
    .input(z.object({ templateId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const missionModel = new MissionModel(ctx.serverDB);
      const row = await missionModel.deactivateDepartment(input.templateId);
      return row ? mapDbDepartment(row) : null;
    }),

  decideApproval: missionProcedure
    .input(
      z.object({
        approvalId: z.string().min(1),
        decidedBy: z.string().default('Eng. Hazem Elerefy'),
        decision: z.enum(['approved', 'rejected']),
        missionId: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const missionModel = new MissionModel(ctx.serverDB);
        const engine = new MissionEngine(missionModel);
        const journalManager = new MissionJournalManager(missionModel);

        const step = await engine.decideAndConsumeApproval({
          approvalId: input.approvalId,
          decidedBy: input.decidedBy,
          decision: input.decision,
          missionId: input.missionId,
        });

        let runResult = null;
        if (input.decision === 'approved' && step.disposition === 'resumed') {
          const dbMission = await missionModel.getMission(input.missionId);
          const orgContext = await resolveOrgContext(
            missionModel,
            dbMission?.departmentId,
            dbMission?.projectId,
          );
          const executor = new MarketingMissionExecutor(
            input.missionId,
            process.cwd(),
            journalManager,
            undefined,
            orgContext,
          );
          runResult = await engine.runMission(input.missionId, executor, { concurrencyCap: 2 });
        }

        const detail = await buildFullMissionDetail(missionModel, input.missionId);
        return { detail, runResult, step };
      } catch (error: any) {
        throw new TRPCError({
          cause: error,
          code: 'BAD_REQUEST',
          message: error?.message || 'Failed to process approval decision',
        });
      }
    }),

  deleteProject: missionProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const missionModel = new MissionModel(ctx.serverDB);
      await missionModel.deleteProject(input.id);
      return { deleted: true, id: input.id };
    }),

  getById: missionProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      const missionModel = new MissionModel(ctx.serverDB);
      const detail = await buildFullMissionDetail(missionModel, input.id);
      if (!detail) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `Mission ${input.id} not found` });
      }
      return detail;
    }),

  getCaoTree: missionProcedure
    .input(
      z
        .object({
          mode: z.enum(['company', 'individual']).default('company'),
        })
        .optional(),
    )
    .query(async ({ input, ctx }) => {
      const isAdmin = await resolveServerAdmin(ctx);
      if (!isAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            'FORBIDDEN: Server-side admin authentication and role required to access /azzar/cao tree and telemetry.',
        });
      }

      const missionModel = new MissionModel(ctx.serverDB);
      const [wbState, missionRows] = await Promise.all([
        buildPostgreSQLWorkbenchState(missionModel, ctx),
        missionModel.listMissions(30),
      ]);
      const missionDetails = await Promise.all(
        missionRows.map((r) => buildFullMissionDetail(missionModel, r.id)),
      );
      const missions = missionDetails
        .filter((d): d is NonNullable<typeof d> => d !== null)
        .map((d) => d.workbenchMission as any);

      const data: WorkbenchData = {
        departments: wbState.departments,
        installs: wbState.installs,
        isAdmin: true,
        lastSeenAt: null,
        memory: [],
        missions,
        mode: input?.mode ?? 'company',
        personalRules: defaultRuleSet(),
        projects: wbState.projects,
      };

      return {
        isAdmin: true,
        missions,
        tree: buildCaoTree(data, input?.mode ?? 'company'),
      };
    }),

  getWorkbenchState: missionProcedure.query(async ({ ctx }) => {
    const missionModel = new MissionModel(ctx.serverDB);
    return buildPostgreSQLWorkbenchState(missionModel, ctx);
  }),

  installAgent: missionProcedure
    .input(
      z.object({
        departmentId: z.string().optional(),
        projectId: z.string().optional(),
        templateId: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const template = getAgentTemplate(input.templateId);
      if (!template) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Refused by server: Agent "${input.templateId}" does not exist in catalog.`,
        });
      }
      if (template.availability !== 'available') {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: `Refused by server: Agent "${input.templateId}" (${template.name.en}) is Coming soon and cannot be installed. Only Marketing Manager (marketing-manager) is Available.`,
        });
      }
      if (template.kind === 'specialist') {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: `Refused by server: Specialist "${input.templateId}" is managed by its department manager (${template.parentId}) and is not installed standalone.`,
        });
      }

      const missionModel = new MissionModel(ctx.serverDB);
      const row = await missionModel.installAgent({
        departmentIdsJson: input.departmentId ? [input.departmentId] : [],
        installedAt: new Date(),
        projectIdsJson: input.projectId ? [input.projectId] : [],
        status: 'active',
        templateId: input.templateId,
      });
      return mapDbInstall(row);
    }),

  list: missionProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(30) }).optional())
    .query(async ({ input, ctx }) => {
      const missionModel = new MissionModel(ctx.serverDB);
      const rows = await missionModel.listMissions(input?.limit ?? 30);
      const details = await Promise.all(
        rows.map((r) => buildFullMissionDetail(missionModel, r.id)),
      );
      return details.filter((d): d is NonNullable<typeof d> => d !== null);
    }),

  resume: missionProcedure
    .input(z.object({ missionId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      try {
        const missionModel = new MissionModel(ctx.serverDB);
        const engine = new MissionEngine(missionModel);
        const journalManager = new MissionJournalManager(missionModel);
        const dbMission = await missionModel.getMission(input.missionId);
        const orgContext = await resolveOrgContext(
          missionModel,
          dbMission?.departmentId,
          dbMission?.projectId,
        );
        const executor = new MarketingMissionExecutor(
          input.missionId,
          process.cwd(),
          journalManager,
          undefined,
          orgContext,
        );
        const runResult = await engine.runMission(input.missionId, executor, { concurrencyCap: 2 });
        const detail = await buildFullMissionDetail(missionModel, input.missionId);
        return { detail, runResult };
      } catch (error: any) {
        throw new TRPCError({
          cause: error,
          code: 'INTERNAL_SERVER_ERROR',
          message: error?.message || 'Failed to resume mission',
        });
      }
    }),

  unassignAgent: missionProcedure
    .input(
      z.object({
        departmentId: z.string().optional(),
        projectId: z.string().optional(),
        templateId: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const missionModel = new MissionModel(ctx.serverDB);
      const updated = await missionModel.unassignAgent(input.templateId, {
        departmentId: input.departmentId,
        projectId: input.projectId,
      });
      return updated ? mapDbInstall(updated) : null;
    }),

  uninstallAgent: missionProcedure
    .input(z.object({ templateId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const missionModel = new MissionModel(ctx.serverDB);
      const removed = await missionModel.uninstallAgent(input.templateId);
      return { removed, templateId: input.templateId };
    }),

  updateDepartment: missionProcedure
    .input(
      z.object({
        context: z.string().optional(),
        customName: z.object({ ar: z.string(), en: z.string() }).optional(),
        instructions: z.string().optional(),
        rules: z.any().optional(),
        sources: z
          .array(
            z.object({
              content: z.string().optional(),
              id: z.string(),
              kind: z.enum(['file', 'link', 'note']),
              name: z.string(),
              shareable: z.boolean(),
            }),
          )
          .optional(),
        templateId: z.string().min(1),
        tone: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const missionModel = new MissionModel(ctx.serverDB);
      const existing = await missionModel.getDepartment(input.templateId);
      const row = await missionModel.upsertDepartment({
        active: existing ? existing.active : true,
        context: input.context ?? existing?.context ?? '',
        customNameJson: input.customName ?? (existing?.customNameJson as any),
        instructions: input.instructions ?? existing?.instructions ?? '',
        rulesJson: input.rules ?? existing?.rulesJson ?? defaultRuleSet(),
        sourcesJson: input.sources ?? (existing?.sourcesJson as any) ?? [],
        templateId: input.templateId,
        tone: input.tone ?? existing?.tone ?? '',
      });
      return mapDbDepartment(row);
    }),

  updateProject: missionProcedure
    .input(
      z.object({
        context: z.string().optional(),
        description: z.string().optional(),
        id: z.string().min(1),
        inherit: z
          .object({
            policies: z.boolean(),
            sources: z.boolean(),
            tone: z.boolean(),
          })
          .optional(),
        name: z.string().optional(),
        sources: z
          .array(
            z.object({
              content: z.string().optional(),
              id: z.string(),
              kind: z.enum(['file', 'link', 'note']),
              name: z.string(),
              shareable: z.boolean(),
            }),
          )
          .optional(),
        visibility: z.enum(['private', 'shared']).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const missionModel = new MissionModel(ctx.serverDB);
      const updated = await missionModel.updateProject(input.id, {
        context: input.context,
        description: input.description,
        inheritJson: input.inherit,
        name: input.name,
        sourcesJson: input.sources,
        visibility: input.visibility,
      });
      if (!updated) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `Project ${input.id} not found` });
      }
      return mapDbProject(updated);
    }),
});
