import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { MissionModel } from '@/database/models/mission';
import { publicProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { MissionEngine } from '@/server/services/missionEngine/engine';
import { MissionJournalManager } from '@/server/services/missionEngine/journal';
import {
  MARKETING_MISSION_DAG,
  MarketingMissionExecutor,
} from '@/server/services/missionEngine/marketingMission';
import type { MissionDAGDef, MissionReceipt } from '@/server/services/missionEngine/types';

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

  const stateJson = (checkpoint?.stateJson || {}) as Record<string, any>;
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

  const activeSpecialists = mappedNodes
    .filter((n) => n.status === 'running')
    .map((n) => n.agentId);

  const mappedEvents = journal.map((j) => {
    const p = (j.payload || {}) as Record<string, any>;
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
    ownerId: dbMission.departmentId || 'marketing',
    ownerType: 'department' as const,
    projectId: null,
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
            stateJson: checkpoint.stateJson,
          }
        : null,
      journal: journal.map((j) => ({
        createdAt: j.createdAt.toISOString(),
        eventType: j.eventType,
        id: j.id,
        missionId: j.missionId,
        payload: j.payload,
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

export const missionRouter = router({
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
        departmentId: z.string().optional(),
        goal: z.string().min(1),
        mode: z.enum(['company', 'individual']).optional(),
        modelId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const missionModel = new MissionModel(ctx.serverDB);
        const engine = new MissionEngine(missionModel);
        const journalManager = new MissionJournalManager(missionModel);
        const missionId = `mission_${Date.now()}`;

        const dagDef: MissionDAGDef = {
          ...MARKETING_MISSION_DAG,
          departmentId: input.departmentId || 'marketing',
          id: missionId,
          mode: input.mode || 'company',
          title: input.goal.trim(),
        };

        await engine.createMission(dagDef);
        const executor = new MarketingMissionExecutor(missionId, process.cwd(), journalManager);
        const runResult = await engine.runMission(missionId, executor, { concurrencyCap: 2 });
        const detail = await buildFullMissionDetail(missionModel, missionId);

        return { detail, missionId, runResult };
      } catch (error: any) {
        throw new TRPCError({
          cause: error,
          code: 'INTERNAL_SERVER_ERROR',
          message: error?.message || 'Failed to create and run mission',
        });
      }
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
          const executor = new MarketingMissionExecutor(
            input.missionId,
            process.cwd(),
            journalManager,
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
        const executor = new MarketingMissionExecutor(
          input.missionId,
          process.cwd(),
          journalManager,
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
});
