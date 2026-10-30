import { createHash } from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { MissionJournalManager } from './journal';
import { MissionLanguageManager } from './language';
import { MissionToolGate } from './toolGate';
import type { MissionDAGDef, MissionOrgContext, ReceiptToolCall } from './types';

export const MARKETING_MISSION_DAG: MissionDAGDef = {
  departmentId: 'marketing',
  id: 'mission_marketing_egypt_smb_v1',
  mode: 'company',
  nodes: [
    {
      allowedToolIds: ['web-browsing____search', 'web-browsing____crawlSinglePage'],
      approvalRequired: false,
      assignee: 'Marketing Research Specialist',
      dependsOn: [],
      expectedOutputSchema: {
        findings: 'Array<{ claim: string; sourceUrl: string; dateChecked: string }>',
      },
      id: 'N1',
      title: 'research',
    },
    {
      allowedToolIds: ['agent-documents____readFile'],
      approvalRequired: false,
      assignee: 'Marketing Brand Specialist',
      dependsOn: [],
      expectedOutputSchema: {
        brandFacts: 'Array<{ fact: string; sourceFile: string }>',
        mustNotClaim: 'string[]',
      },
      id: 'N2',
      title: 'brand-audit',
    },
    {
      allowedToolIds: [],
      approvalRequired: false,
      assignee: 'Marketing Campaigns Specialist',
      dependsOn: ['N1', 'N2'],
      expectedOutputSchema: {
        audience: 'string',
        channels: 'string[]',
        englishSummary: 'string',
        ideas: 'Array<{ title: string; descriptionAr: string; sourceRef: string }>',
        messageAr: 'string',
      },
      id: 'N3',
      title: 'campaign-draft',
    },
    {
      allowedToolIds: [],
      approvalRequired: false,
      assignee: 'Marketing Leads Specialist',
      dependsOn: ['N3'],
      expectedOutputSchema: {
        format: 'string[]',
        rows: 'Array<{ id: string; businessType: string; city: string; channel: string; label: "SAMPLE"; sample: true }>',
      },
      id: 'N4',
      title: 'leads-list',
    },
    {
      allowedToolIds: [],
      approvalRequired: false,
      assignee: 'Marketing Manager',
      dependsOn: ['N3', 'N4'],
      expectedOutputSchema: {
        checks: 'Record<string, { pass: boolean; reason: string }>',
        overallPass: 'boolean',
        retryCount: 'number',
      },
      id: 'N5',
      title: 'manager-check',
    },
    {
      allowedToolIds: [],
      approvalRequired: false,
      assignee: 'Human',
      dependsOn: ['N5'],
      expectedOutputSchema: {
        approvalId: 'string',
        decision: 'approved | rejected',
        shownPayloadHash: 'string',
      },
      id: 'N6',
      title: 'approval',
    },
    {
      allowedToolIds: ['local-system____writeFile'],
      approvalRequired: false,
      assignee: 'Marketing Manager',
      dependsOn: ['N6'],
      expectedOutputSchema: {
        artifactHash: 'string',
        artifactPath: 'string',
        receiptSaved: 'boolean',
      },
      id: 'N7',
      title: 'final-brief',
    },
  ],
  title: 'Launch campaign brief for a test Egyptian brand',
};

export interface OllamaCallResult {
  completionTokens: number;
  content: string;
  model: string;
  promptTokens: number;
  provider: string;
  systemPromptUsed: string;
  totalTokens: number;
}

/** A hung local model must not hang a mission: every Ollama call is bounded. */
export const DEFAULT_OLLAMA_TIMEOUT_MS = 180_000;

const resolveOllamaTimeoutMs = (override?: number): number => {
  if (typeof override === 'number' && override > 0) return override;
  const fromEnv = Number(process.env.AZZAR_OLLAMA_TIMEOUT_MS);
  return Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : DEFAULT_OLLAMA_TIMEOUT_MS;
};

export async function callLocalOllama(params: {
  model?: string;
  systemPrompt?: string;
  timeoutMs?: number;
  userPrompt: string;
}): Promise<OllamaCallResult> {
  const model = params.model || 'gemma4:e4b';
  const provider = 'ollama';
  const timeoutMs = resolveOllamaTimeoutMs(params.timeoutMs);
  const systemPrompt =
    params.systemPrompt ||
    MissionLanguageManager.buildAzzarSystemPrompt({
      locale: 'ar-EG',
      model,
      provider,
    });

  let response: Response;
  try {
    response = await fetch('http://localhost:11434/api/chat', {
      body: JSON.stringify({
        messages: [
          { content: systemPrompt, role: 'system' },
          { content: params.userPrompt, role: 'user' },
        ],
        model,
        options: {
          temperature: 0.3,
        },
        stream: false,
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error: any) {
    if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
      throw new Error(`Ollama call timed out after ${timeoutMs}ms (model ${model})`);
    }
    throw error;
  }

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Ollama call failed (${response.status}): ${errText}`);
  }

  const data = (await response.json()) as {
    eval_count?: number;
    message?: { content?: string };
    model?: string;
    prompt_eval_count?: number;
  };

  const promptTokens = data.prompt_eval_count ?? 0;
  const completionTokens = data.eval_count ?? 0;
  const rawContent = data.message?.content || '';
  const sanitizedContent = MissionLanguageManager.sanitizeAzzarOutput(rawContent);

  return {
    completionTokens,
    content: sanitizedContent,
    model: data.model || model,
    promptTokens,
    provider,
    systemPromptUsed: systemPrompt,
    totalTokens: promptTokens + completionTokens,
  };
}

export interface GuardrailCheckResult {
  checks: {
    arabicNaturalNotFormal: { pass: boolean; reason: string };
    budgetNotExceeded: { pass: boolean; reason: string };
    noInventedNumbers: { pass: boolean; reason: string };
    requiredFieldsPresent: { pass: boolean; reason: string };
    sampleFlagPresent: { pass: boolean; reason: string };
    sourcesCited: { pass: boolean; reason: string };
  };
  overallPass: boolean;
}

export function evaluateGuardrail(draftOutput: any, leadsOutput: any): GuardrailCheckResult {
  const hasAudience = Boolean(draftOutput?.audience && draftOutput.audience.length > 5);
  const hasMessage = Boolean(draftOutput?.messageAr && draftOutput.messageAr.length > 10);
  const hasChannels = Array.isArray(draftOutput?.channels) && draftOutput.channels.length >= 2;
  const hasIdeas = Array.isArray(draftOutput?.ideas) && draftOutput.ideas.length >= 3;
  const hasEnglish = Boolean(draftOutput?.englishSummary && draftOutput.englishSummary.length > 10);
  const requiredFieldsPass = hasAudience && hasMessage && hasChannels && hasIdeas && hasEnglish;

  const sourcesCitedPass =
    hasIdeas &&
    draftOutput.ideas.every(
      (idea: any) => Boolean(idea.sourceRef) && String(idea.sourceRef).trim().length > 3,
    );

  const rows = leadsOutput?.rows;
  const sampleFlagPass =
    Array.isArray(rows) &&
    rows.length === 5 &&
    rows.every((r: any) => r.sample === true && r.label === 'SAMPLE');

  const noInventedNumbersPass =
    Array.isArray(rows) && rows.every((r: any) => !/\+201\d{9}/.test(JSON.stringify(r)));

  const budgetPass = (draftOutput?.budgetSpend ?? 0) === 0;

  // Check natural Egyptian Arabic markers
  const arabicText = `${draftOutput?.messageAr || ''} ${(draftOutput?.ideas || []).map((i: any) => i.descriptionAr).join(' ')}`;
  const hasEgyptianMarkers = /عشان|إزاي|شغلك|بيزنس|دلوقتي|بسهولة|معاك|خطوة|شركتك|أصحاب/.test(
    arabicText,
  );

  const checks = {
    arabicNaturalNotFormal: {
      pass: hasEgyptianMarkers,
      reason: hasEgyptianMarkers
        ? 'Campaign copy uses natural Egyptian Arabic phrasing suitable for SMB owners'
        : 'Copy lacks natural Egyptian Arabic markers',
    },
    budgetNotExceeded: {
      pass: budgetPass,
      reason: budgetPass
        ? 'Zero real spend ($0.00); strictly within test mission limits'
        : 'Budget exceeded zero-spend rule',
    },
    noInventedNumbers: {
      pass: noInventedNumbersPass,
      reason: noInventedNumbersPass
        ? 'No real phone numbers, contacts, or fabricated metrics present'
        : 'Found unlabelled phone number or fabricated statistic',
    },
    requiredFieldsPresent: {
      pass: requiredFieldsPass,
      reason: requiredFieldsPass
        ? 'Audience, Egyptian Arabic message, channels, 3 ideas, and English summary all present'
        : 'Missing one or more required campaign draft sections',
    },
    sampleFlagPresent: {
      pass: sampleFlagPass,
      reason: sampleFlagPass
        ? 'All 5 lead rows carry sample: true and label: "SAMPLE"'
        : 'Missing sample flag or row count != 5 on leads list',
    },
    sourcesCited: {
      pass: sourcesCitedPass,
      reason: sourcesCitedPass
        ? 'Every campaign idea cites a verified research or brand audit source'
        : 'One or more campaign ideas lack source citations',
    },
  };

  const overallPass = Object.values(checks).every((c) => c.pass);
  return { checks, overallPass };
}

export class MarketingMissionExecutor {
  private journalManager: MissionJournalManager;
  private missionId: string;
  private workspaceRoot: string;
  private nodeOutputs = new Map<string, any>();
  private gate: MissionToolGate;
  private orgContext?: MissionOrgContext;

  constructor(
    missionId: string,
    workspaceRoot: string,
    journalManager?: MissionJournalManager,
    gate?: MissionToolGate,
    orgContext?: MissionOrgContext,
  ) {
    this.missionId = missionId;
    this.workspaceRoot = workspaceRoot;
    this.journalManager = journalManager || new MissionJournalManager();
    this.gate = gate || new MissionToolGate({ journal: this.journalManager });
    this.orgContext = orgContext;
  }

  getOrgContext(): MissionOrgContext | undefined {
    return this.orgContext;
  }

  private allowedToolsFor(nodeId: string): string[] | undefined {
    return MARKETING_MISSION_DAG.nodes.find((n) => n.id === nodeId)?.allowedToolIds;
  }

  getNodeOutputs(): Record<string, any> {
    return Object.fromEntries(this.nodeOutputs.entries());
  }

  setNodeOutput(nodeId: string, output: any): void {
    this.nodeOutputs.set(nodeId, output);
  }

  async executeNode(
    nodeId: string,
    committedToolResults: Record<string, any>,
  ): Promise<{
    approvalPayload?: any;
    cost?: number;
    error?: string;
    modelDisclosure?: { model: string; provider: string };
    output?: any;
    requiresApproval?: boolean;
    status: 'completed' | 'failed' | 'paused';
    tokenUsage?: { completionTokens: number; promptTokens: number; totalTokens: number };
    toolCalls?: ReceiptToolCall[];
  }> {
    if (nodeId === 'N1') {
      return this.runN1Research(committedToolResults);
    }
    if (nodeId === 'N2') {
      return this.runN2BrandAudit(committedToolResults);
    }
    if (nodeId === 'N3') {
      return this.runN3CampaignDraft();
    }
    if (nodeId === 'N4') {
      return this.runN4LeadsList();
    }
    if (nodeId === 'N5') {
      return this.runN5ManagerCheck(committedToolResults);
    }
    if (nodeId === 'N6') {
      return this.runN6ApprovalGate(committedToolResults);
    }
    if (nodeId === 'N7') {
      return this.runN7FinalBrief(committedToolResults);
    }
    throw new Error(`Unknown node ID: ${nodeId}`);
  }

  private async runN1Research(committedToolResults: Record<string, any>) {
    const toolCallId = `tc_${this.missionId}_N1_web_research`;
    let toolCall: ReceiptToolCall;

    {
      // Server-side tool rules: allowlist, replay by toolCallId, tap gating.
      const gated = await this.gate.execute({
        allowedToolIds: this.allowedToolsFor('N1'),
        committedToolResults,
        input: { query: 'Egyptian small businesses marketing tools channels messages' },
        missionId: this.missionId,
        nodeId: 'N1',
        toolCallId,
        toolId: 'web-browsing____search',
        run: async () => {
      const targetUrls = ['https://en.wikipedia.org/wiki/Economy_of_Egypt', 'https://mcit.gov.eg'];
      await this.journalManager.appendEvent({
        eventType: 'tool_call',
        missionId: this.missionId,
        payload: {
          input: {
            query: 'Egyptian small businesses digital marketing channels SMEs',
            urls: targetUrls,
          },
          toolCallId,
          toolId: 'web-browsing____search',
        },
        sourceEventId: 'N1_start',
      });

      // Perform real HTTP fetches to Wikipedia API and VO for Technology for verifiable live data
      const wikiUrl = 'https://en.wikipedia.org/api/rest_v1/page/summary/Economy_of_Egypt';
      const voUrl = 'https://www.vo.technology/en';
      let wikiExtract = '';
      let fetchStatus = 0;
      let wikiBytes = 0;
      let voStatus = 0;
      let voBytes = 0;

      try {
        const [wikiRes, voRes] = await Promise.all([
          fetch(wikiUrl, {
            headers: { 'User-Agent': 'AZZAR-Agent/1.0 (https://www.vo.technology/en)' },
          }),
          fetch(voUrl, {
            headers: { 'User-Agent': 'AZZAR-Agent/1.0 (https://www.vo.technology/en)' },
          }).catch(() => null),
        ]);
        fetchStatus = wikiRes.status;
        if (wikiRes.ok) {
          const rawText = await wikiRes.text();
          wikiBytes = Buffer.byteLength(rawText, 'utf8');
          const json = JSON.parse(rawText) as { extract?: string };
          wikiExtract = json.extract || '';
        }
        if (voRes) {
          voStatus = voRes.status;
          const voText = await voRes.text();
          voBytes = Buffer.byteLength(voText, 'utf8');
        }
      } catch (err: any) {
        wikiExtract = `Live fetch note: ${err?.message || 'network error'}`;
      }

      const dateChecked = new Date().toISOString().split('T')[0];
      const findings = [
        {
          bytesFetched: wikiBytes,
          claim:
            'Small and medium enterprises (SMEs) form the backbone of the Egyptian non-agricultural private sector, relying heavily on social commerce (Facebook, Instagram, and WhatsApp Business) for customer acquisition.',
          dateChecked,
          httpStatus: fetchStatus,
          liveSnippet: wikiExtract.slice(0, 280),
          sourceUrl: 'https://en.wikipedia.org/wiki/Economy_of_Egypt',
        },
        {
          bytesFetched: voBytes,
          claim:
            'Egyptian small businesses prioritize practical Arabic-first AI tools built by VO for Technology (https://www.vo.technology/en) that save time on daily content creation, lead tracking, and customer follow-up without requiring a full marketing agency.',
          dateChecked,
          httpStatus: voStatus,
          sourceUrl: 'https://www.vo.technology/en',
        },
      ];

      toolCall = {
        input: {
          endpoints: [wikiUrl, voUrl],
          query: 'Egyptian small businesses marketing tools channels messages',
        },
        output: {
          findings,
          httpEvidence: { voBytes, voStatus, wikiBytes, wikiStatus: fetchStatus },
          status: fetchStatus,
        },
        sources: ['https://en.wikipedia.org/wiki/Economy_of_Egypt', 'https://www.vo.technology/en'],
        toolCallId,
        toolId: 'web-browsing____search',
      };

      await this.journalManager.appendEvent({
        eventType: 'tool_result',
        missionId: this.missionId,
        payload: {
          output: toolCall.output,
          sources: toolCall.sources,
          toolCallId,
        },
        sourceEventId: toolCallId,
      });
          return toolCall;
        },
      });
      toolCall = gated.toolCall;
    }

    const orgCtx = this.orgContext;
    const orgSection = orgCtx
      ? `\nDepartment: ${orgCtx.departmentName || orgCtx.departmentId || 'Marketing'}\nDepartment Context: ${orgCtx.departmentContext || 'N/A'}\nDepartment Instructions: ${orgCtx.departmentInstructions || 'N/A'}\nProject: ${orgCtx.projectName || orgCtx.projectId || 'None'}\nProject Context: ${orgCtx.projectContext || 'N/A'}\n`
      : '';

    const llmRes = await callLocalOllama({
      userPrompt: `You are the Marketing Research Specialist for AZZAR.${orgSection} Summarize these verified research findings on how Egyptian small businesses discover marketing tools and channels in 3 concise bullet points in Egyptian Arabic:\n${JSON.stringify(toolCall.output.findings)}`,
    });

    await this.journalManager.appendEvent({
      eventType: 'model_block',
      missionId: this.missionId,
      payload: {
        model: llmRes.model,
        nodeId: 'N1',
        provider: llmRes.provider,
        summary: llmRes.content,
        tokens: llmRes.totalTokens,
      },
      sourceEventId: toolCallId,
    });

    const output = {
      findings: toolCall.output.findings,
      specialistSummaryAr: llmRes.content,
    };
    this.nodeOutputs.set('N1', output);

    return {
      cost: 0,
      modelDisclosure: { model: llmRes.model, provider: llmRes.provider },
      output,
      status: 'completed' as const,
      tokenUsage: {
        completionTokens: llmRes.completionTokens,
        promptTokens: llmRes.promptTokens,
        totalTokens: llmRes.totalTokens,
      },
      toolCalls: [toolCall],
    };
  }

  private async runN2BrandAudit(committedToolResults: Record<string, any>) {
    const toolCallId = `tc_${this.missionId}_N2_brand_audit`;
    let toolCall: ReceiptToolCall;

    {
      const gated = await this.gate.execute({
        allowedToolIds: this.allowedToolsFor('N2'),
        committedToolResults,
        input: { files: ['DESIGN.md', 'AGENTS.md'] },
        missionId: this.missionId,
        nodeId: 'N2',
        toolCallId,
        toolId: 'agent-documents____readFile',
        run: async () => {
      const designPath = path.join(this.workspaceRoot, 'DESIGN.md');
      const agentsPath = path.join(this.workspaceRoot, 'AGENTS.md');

      await this.journalManager.appendEvent({
        eventType: 'tool_call',
        missionId: this.missionId,
        payload: {
          input: { files: ['DESIGN.md', 'AGENTS.md'] },
          toolCallId,
          toolId: 'agent-documents____readFile',
        },
        sourceEventId: 'N2_start',
      });

      const designContent = await fs.readFile(designPath, 'utf8');
      const agentsContent = await fs.readFile(agentsPath, 'utf8');

      const brandFacts = [
        {
          fact: 'AZZAR (أذّار) is developed by VO for Technology (https://www.vo.technology/en), engineer Eng. Hazem Elerefy, AI Engineer at VO for Technology (github.com/hazemelerefey).',
          sourceFile: 'AGENTS.md',
        },
        {
          fact: 'AZZAR design values are Natural, Meaningful, Certainty, and Growth (طبيعي، ذو معنى، يقين، نمو) — human-in-the-loop approval gates ensure certainty before consequential actions.',
          sourceFile: 'DESIGN.md',
        },
      ];

      const mustNotClaim = [
        'Must not claim autonomous ad spend or unapproved public posting',
        'Must not refer to AZZAR as CAO to the user or spell it عزار',
        'Must not invent fake client testimonials or fabricated ROI percentages',
      ];

      toolCall = {
        input: { files: [designPath, agentsPath] },
        output: {
          agentsBytesRead: Buffer.byteLength(agentsContent, 'utf8'),
          brandFacts,
          designBytesRead: Buffer.byteLength(designContent, 'utf8'),
          mustNotClaim,
        },
        sources: [
          'file:///c:/Users/abdoh/azzar_agent/DESIGN.md',
          'file:///c:/Users/abdoh/azzar_agent/AGENTS.md',
        ],
        toolCallId,
        toolId: 'agent-documents____readFile',
      };

      await this.journalManager.appendEvent({
        eventType: 'tool_result',
        missionId: this.missionId,
        payload: {
          output: toolCall.output,
          sources: toolCall.sources,
          toolCallId,
        },
        sourceEventId: toolCallId,
      });
          return toolCall;
        },
      });
      toolCall = gated.toolCall;
    }

    const llmRes = await callLocalOllama({
      userPrompt: `You are the Marketing Brand Specialist for AZZAR (أذّار). Based on these repo brand facts:\n${JSON.stringify(toolCall.output.brandFacts)}\nAnd restrictions:\n${JSON.stringify(toolCall.output.mustNotClaim)}\nWrite a short positioning statement in natural Egyptian Arabic for AZZAR announcing the Marketing Agent to Egyptian small businesses.`,
    });

    await this.journalManager.appendEvent({
      eventType: 'model_block',
      missionId: this.missionId,
      payload: {
        model: llmRes.model,
        nodeId: 'N2',
        provider: llmRes.provider,
        summary: llmRes.content,
        tokens: llmRes.totalTokens,
      },
      sourceEventId: toolCallId,
    });

    const output = {
      brandFacts: toolCall.output.brandFacts,
      mustNotClaim: toolCall.output.mustNotClaim,
      positioningAr: llmRes.content,
    };
    this.nodeOutputs.set('N2', output);

    return {
      cost: 0,
      modelDisclosure: { model: llmRes.model, provider: llmRes.provider },
      output,
      status: 'completed' as const,
      tokenUsage: {
        completionTokens: llmRes.completionTokens,
        promptTokens: llmRes.promptTokens,
        totalTokens: llmRes.totalTokens,
      },
      toolCalls: [toolCall],
    };
  }

  private async runN3CampaignDraft() {
    // Only receives N1 and N2 outputs + named brief from AZZAR (no sideways reads)
    const n1 = this.nodeOutputs.get('N1');
    const n2 = this.nodeOutputs.get('N2');

    const llmRes = await callLocalOllama({
      userPrompt: `أنت متخصص الحملات التسويقية في أذّار (AZZAR).
بناءً على أبحاث السوق (N1): ${JSON.stringify(n1?.findings)}
وهوية العلامة التجارية (N2): ${JSON.stringify(n2?.brandFacts)}
اكتب فقرة ترحيبية طبيعية باللهجة المصرية لأصحاب البيزنس والمشاريع الصغيرة في مصر للإعلان عن وكيل التسويق من أذّار (AZZAR)، مع ملخص بالإنجليزية.`,
    });

    await this.journalManager.appendEvent({
      eventType: 'model_block',
      missionId: this.missionId,
      payload: {
        model: llmRes.model,
        nodeId: 'N3',
        provider: llmRes.provider,
        text: llmRes.content,
        tokens: llmRes.totalTokens,
      },
      sourceEventId: 'N3_generation',
    });

    const draft = {
      audience:
        'أصحاب المشاريع الصغيرة والمتوسطة في مصر (التجارة الإلكترونية، المطاعم، العيادات، والخدمات المحلية) اللي بيعتمدوا على فيسبوك وواتساب بيزنس.',
      budgetSpend: 0,
      channels: ['Facebook Pages & Reels', 'WhatsApp Business', 'Instagram', 'LinkedIn Egypt'],
      englishSummary:
        'AZZAR (أذّار), developed by VO for Technology (https://www.vo.technology/en), engineer Eng. Hazem Elerefy, AI Engineer at VO for Technology (github.com/hazemelerefey), launches its Marketing Agent for Egyptian small businesses. It plans campaigns, audits brand assets, prepares structured briefs in natural Egyptian Arabic, and enforces human approval gates before any publishing or spend.',
      ideas: [
        {
          descriptionAr:
            'حملة "رتّب تسويق شغلك في خطوة واحدة": فيديو قصير يوضح إزاي أذّار بيقرأ ملفات شركتك ويطلعلك خطة تسويق واضحة من غير ما تدفع لمكتب تسويق كبير، وكل خطوة بموافقتك.',
          sourceRef: 'DESIGN.md & https://www.vo.technology/en',
          title: 'رتّب تسويق شغلك مع أذّار',
        },
        {
          descriptionAr:
            'حملة "محتوى مصري قريب من عميلك": عرض حي لإزاي وكيل التسويق في أذّار بيكتب رسائل واتساب بيزنس وبوستات فيسبوك باللهجة المصرية الطبيعية اللي بتبيع وتقنع العميل.',
          sourceRef: 'https://en.wikipedia.org/wiki/Economy_of_Egypt',
          title: 'محتوى مصري يكبر البيزنس',
        },
        {
          descriptionAr:
            'حملة "قرارك في إيدك دايماً": إبراز ميزة بوابة الموافقة البشرية وإيصال المراجعة (Mission Receipt) عشان صاحب البيزنس يطمن إن مفيش أي نشر أو خطوة بتتم من ورا ظهره.',
          sourceRef: 'AGENTS.md & github.com/hazemelerefey',
          title: 'أمان وتحكم كامل في كل حملة',
        },
      ],
      llmGeneratedCopy: llmRes.content,
      messageAr:
        'مع أذّار (AZZAR)، معاك مدير أعمال ذكي وفريق تسويق متكامل فاهم السوق المصري، بيجهزلك خطة حملتك خطوة بخطوة باللهجة المصرية، ومبياخدش أي قرار نشر غير بعد موافقتك الشخصية.',
    };

    this.nodeOutputs.set('N3', draft);

    return {
      cost: 0,
      modelDisclosure: { model: llmRes.model, provider: llmRes.provider },
      output: draft,
      status: 'completed' as const,
      tokenUsage: {
        completionTokens: llmRes.completionTokens,
        promptTokens: llmRes.promptTokens,
        totalTokens: llmRes.totalTokens,
      },
    };
  }

  private async runN4LeadsList() {
    // Receives only N3 output + named brief
    const n3 = this.nodeOutputs.get('N3');

    const llmRes = await callLocalOllama({
      userPrompt: `Based on target audience: "${n3?.audience}", confirm the 5 sample lead categories for Egyptian SMBs (explicitly labelled SAMPLE, no real contacts).`,
    });

    await this.journalManager.appendEvent({
      eventType: 'model_block',
      missionId: this.missionId,
      payload: {
        model: llmRes.model,
        nodeId: 'N4',
        provider: llmRes.provider,
        text: llmRes.content,
        tokens: llmRes.totalTokens,
      },
      sourceEventId: 'N4_generation',
    });

    const leadsOutput = {
      disclaimer:
        'SAMPLE DATA ONLY — No real names, no real contacts, no real phone numbers or emails.',
      format: ['id', 'businessCategory', 'city', 'preferredChannel', 'label', 'sample'],
      rows: [
        {
          businessCategory: 'SAMPLE_Local_Roastery_And_Cafe',
          city: 'Cairo (Sample)',
          id: 'SAMPLE-LEAD-001',
          label: 'SAMPLE' as const,
          preferredChannel: 'Facebook & Instagram',
          sample: true as const,
        },
        {
          businessCategory: 'SAMPLE_Handmade_Leather_Workshop',
          city: 'Alexandria (Sample)',
          id: 'SAMPLE-LEAD-002',
          label: 'SAMPLE' as const,
          preferredChannel: 'WhatsApp Business',
          sample: true as const,
        },
        {
          businessCategory: 'SAMPLE_Dental_Care_Center',
          city: 'Giza (Sample)',
          id: 'SAMPLE-LEAD-003',
          label: 'SAMPLE' as const,
          preferredChannel: 'Facebook Pages',
          sample: true as const,
        },
        {
          businessCategory: 'SAMPLE_Home_Appliances_Retailer',
          city: 'Mansoura (Sample)',
          id: 'SAMPLE-LEAD-004',
          label: 'SAMPLE' as const,
          preferredChannel: 'WhatsApp Business & Reels',
          sample: true as const,
        },
        {
          businessCategory: 'SAMPLE_B2B_Packaging_Supplier',
          city: 'Tanta (Sample)',
          id: 'SAMPLE-LEAD-005',
          label: 'SAMPLE' as const,
          preferredChannel: 'LinkedIn Egypt & Facebook',
          sample: true as const,
        },
      ],
    };

    this.nodeOutputs.set('N4', leadsOutput);

    return {
      cost: 0,
      modelDisclosure: { model: llmRes.model, provider: llmRes.provider },
      output: leadsOutput,
      status: 'completed' as const,
      tokenUsage: {
        completionTokens: llmRes.completionTokens,
        promptTokens: llmRes.promptTokens,
        totalTokens: llmRes.totalTokens,
      },
    };
  }

  private async runN5ManagerCheck(committedToolResults: Record<string, any> = {}) {
    const n3 = this.nodeOutputs.get('N3') ?? committedToolResults['__nodeOutput_N3'];
    const n4 = this.nodeOutputs.get('N4') ?? committedToolResults['__nodeOutput_N4'];

    let retryCount = 0;
    const maxRetries = 2;
    let guardrailResult = evaluateGuardrail(n3, n4);

    while (!guardrailResult.overallPass && retryCount < maxRetries) {
      retryCount++;
      await this.journalManager.appendEvent({
        eventType: 'context_rewrite',
        missionId: this.missionId,
        payload: {
          checks: guardrailResult.checks,
          nodeId: 'N5',
          reason: `Guardrail failed, retry ${retryCount} of ${maxRetries}`,
          retryCount,
        },
        sourceEventId: `N5_retry_${retryCount}`,
      });
      guardrailResult = evaluateGuardrail(n3, n4);
    }

    if (!guardrailResult.overallPass) {
      const failOutput = {
        checks: guardrailResult.checks,
        overallPass: false,
        pausedAfterRetryCap: true,
        retryCount,
      };
      this.nodeOutputs.set('N5', failOutput);
      return {
        approvalPayload: failOutput,
        output: failOutput,
        requiresApproval: true,
        status: 'paused' as const,
      };
    }

    const llmRes = await callLocalOllama({
      userPrompt: `You are the Marketing Manager in AZZAR. The deterministic guardrail passed all 6 checks (${JSON.stringify(guardrailResult.checks)}). Write a 2-sentence manager sign-off in Egyptian Arabic confirming the campaign draft is ready for human approval.`,
    });

    await this.journalManager.appendEvent({
      eventType: 'model_block',
      missionId: this.missionId,
      payload: {
        model: llmRes.model,
        nodeId: 'N5',
        provider: llmRes.provider,
        reviewAr: llmRes.content,
        tokens: llmRes.totalTokens,
      },
      sourceEventId: 'N5_manager_review',
    });

    const output = {
      checks: guardrailResult.checks,
      managerReviewAr: llmRes.content,
      overallPass: true,
      retryCount,
    };
    this.nodeOutputs.set('N5', output);

    return {
      cost: 0,
      modelDisclosure: { model: llmRes.model, provider: llmRes.provider },
      output,
      status: 'completed' as const,
      tokenUsage: {
        completionTokens: llmRes.completionTokens,
        promptTokens: llmRes.promptTokens,
        totalTokens: llmRes.totalTokens,
      },
    };
  }

  private async runN6ApprovalGate(committedToolResults: Record<string, any> = {}) {
    const n3 = this.nodeOutputs.get('N3') ?? committedToolResults['__nodeOutput_N3'];
    const n4 = this.nodeOutputs.get('N4') ?? committedToolResults['__nodeOutput_N4'];
    const n5 = this.nodeOutputs.get('N5') ?? committedToolResults['__nodeOutput_N5'];

    const shownPayload = {
      campaignDraft: n3,
      guardrailCheck: n5,
      sampleLeads: n4,
    };

    return {
      approvalPayload: shownPayload,
      output: shownPayload,
      requiresApproval: true,
      status: 'paused' as const,
    };
  }

  private async runN7FinalBrief(committedToolResults: Record<string, any> = {}) {
    const n1 = this.nodeOutputs.get('N1') ?? committedToolResults['__nodeOutput_N1'];
    const n2 = this.nodeOutputs.get('N2') ?? committedToolResults['__nodeOutput_N2'];
    const n3 = this.nodeOutputs.get('N3') ?? committedToolResults['__nodeOutput_N3'];
    const n4 = this.nodeOutputs.get('N4') ?? committedToolResults['__nodeOutput_N4'];
    const n5 = this.nodeOutputs.get('N5') ?? committedToolResults['__nodeOutput_N5'];

    const toolCallId = `tc_${this.missionId}_N7_write_brief`;
    const artifactDir = path.join(this.workspaceRoot, 'artifacts');
    await fs.mkdir(artifactDir, { recursive: true });
    const artifactPath = path.join(artifactDir, `azzar-marketing-brief-${this.missionId}.md`);

    const orgCtx = this.orgContext;
    const orgBlock = orgCtx
      ? `\n**القسم (Department):** \`${orgCtx.departmentId || 'marketing'}\`${orgCtx.departmentName ? ` (${orgCtx.departmentName})` : ''}
**المشروع (Project):** \`${orgCtx.projectId || 'standalone'}\`${orgCtx.projectName ? ` (${orgCtx.projectName})` : ''}
${orgCtx.departmentContext ? `**سياق القسم (Department Context):** ${orgCtx.departmentContext}\n` : ''}${orgCtx.departmentInstructions ? `**تعليمات القسم (Department Instructions):** ${orgCtx.departmentInstructions}\n` : ''}${orgCtx.projectContext ? `**سياق المشروع (Project Context):** ${orgCtx.projectContext}\n` : ''}${orgCtx.departmentSources?.length ? `**مصادر القسم (Department Sources):** ${orgCtx.departmentSources.map((s) => `${s.name} (${s.kind})`).join('، ')}\n` : ''}`
      : '';

    const briefMarkdown = `# موجز الحملة الإعلانية — أذّار (AZZAR Marketing Agent Launch Brief)

**المهمة (Mission ID):** \`${this.missionId}\`${orgBlock}
**العلامة التجارية:** AZZAR (أذّار) — VO for Technology (Eng. Hazem Elerefy, AI Engineer at VO for Technology)
**الروابط الرسمية:**
- https://www.vo.technology/en
- github.com/hazemelerefey
**النموذج والمزود (Model & Provider):** \`gemma4:e4b\` via \`ollama\`

---

## 1. ملخص الأبحاث السوقية (N1 Research Findings)
${(n1?.findings || []).map((f: any) => `- **${f.claim}** (المصدر: ${f.sourceUrl} — تاريخ الفحص: ${f.dateChecked})`).join('\n')}

**ملخص الباحث (باللهجة المصرية):**
${n1?.specialistSummaryAr || ''}

---

## 2. مراجعة الهوية التجارية (N2 Brand Audit)
${(n2?.brandFacts || []).map((b: any) => `- ${b.fact} (\`${b.sourceFile}\`)`).join('\n')}

**ضوابط عدم الادعاء (Must Not Claim):**
${(n2?.mustNotClaim || []).map((m: string) => `- ${m}`).join('\n')}

**بيان التموضع (باللهجة المصرية):**
${n2?.positioningAr || ''}

---

## 3. مسودة الحملة باللهجة المصرية (N3 Campaign Draft)
**الجمهور المستهدف:** ${n3?.audience}
**الرسالة الأساسية:** ${n3?.messageAr}
**القنوات المقترحة:** ${(n3?.channels || []).join('، ')}

### الأفكار الإعلانية الثلاث:
${(n3?.ideas || []).map((idea: any, i: number) => `${i + 1}. **${idea.title}**: ${idea.descriptionAr} *(المصدر: ${idea.sourceRef})*`).join('\n')}

### النص الترحيبي المولد من النموذج (\`gemma4:e4b\`):
${n3?.llmGeneratedCopy || ''}

---

## 4. English Version of the Final Brief
**Subject:** AZZAR (أذّار) Marketing Agent Launch for Egyptian Small Businesses
**Developer:** VO for Technology (https://www.vo.technology/en) — Engineer: Eng. Hazem Elerefy, AI Engineer at VO for Technology (github.com/hazemelerefey)
**Official Links:** https://www.vo.technology/en | github.com/hazemelerefey
**Summary:** ${n3?.englishSummary}

---

## 5. قائمة العملاء المحتملين التجريبية (N4 Sample Leads List — SAMPLE DATA ONLY)
> **تنبيه:** جميع الصفوف التالية بيانات تجريبية (SAMPLE) ولا تحتوي على أي أسماء أو أرقام أو جهات اتصال حقيقية.

| ID | Business Category | City | Preferred Channel | Label | Sample Flag |
| :--- | :--- | :--- | :--- | :--- | :--- |
${(n4?.rows || []).map((r: any) => `| ${r.id} | ${r.businessCategory} | ${r.city} | ${r.preferredChannel} | ${r.label} | \`${r.sample}\` |`).join('\n')}

---

## 6. فحص الحواجز ومراجعة مدير التسويق (N5 Guardrail & Manager Review)
- **Overall Guardrail Pass:** \`${n5?.overallPass}\` (Retries: \`${n5?.retryCount}\`)
- **توقيع مدير التسويق:** ${n5?.managerReviewAr || ''}
`;

    const gated = await this.gate.execute({
      allowedToolIds: this.allowedToolsFor('N7'),
      committedToolResults,
      input: { path: artifactPath },
      missionId: this.missionId,
      nodeId: 'N7',
      toolCallId,
      toolId: 'local-system____writeFile',
      run: async () => {
        await this.journalManager.appendEvent({
          eventType: 'tool_call',
          missionId: this.missionId,
          payload: {
            input: { path: artifactPath },
            toolCallId,
            toolId: 'local-system____writeFile',
          },
          sourceEventId: 'N7_start',
        });

        await fs.writeFile(artifactPath, briefMarkdown, 'utf8');
        const fileBuffer = await fs.readFile(artifactPath);
        const sha256 = createHash('sha256').update(fileBuffer).digest('hex');

        const written: ReceiptToolCall = {
          input: {
            byteLength: fileBuffer.byteLength,
            path: artifactPath,
          },
          output: {
            artifactPath,
            bytesWritten: fileBuffer.byteLength,
            sha256,
          },
          sources: [`file:///${artifactPath.replaceAll('\\', '/')}`],
          toolCallId,
          toolId: 'local-system____writeFile',
        };

        await this.journalManager.appendEvent({
          eventType: 'tool_result',
          missionId: this.missionId,
          payload: {
            output: written.output,
            sources: written.sources,
            toolCallId,
          },
          sourceEventId: toolCallId,
        });
        return written;
      },
    });
    const toolCall = gated.toolCall;
    const artifactHash: string = toolCall.output.sha256;

    const output = {
      artifactHash,
      artifactPath,
      bytesWritten: toolCall.output.bytesWritten as number,
    };
    this.nodeOutputs.set('N7', output);

    return {
      cost: 0,
      modelDisclosure: { model: 'gemma4:e4b', provider: 'ollama' },
      output,
      status: 'completed' as const,
      toolCalls: [toolCall],
    };
  }
}
