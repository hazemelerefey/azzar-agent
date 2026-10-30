import { effectiveLevel, toRuntimeApprovalMode } from '../domain/rules';
import type { RuleSet } from '../domain/types';
import { getAgentTemplate } from './index';
import type { AgentTemplate, Bi, ToolGrant } from './types';

/**
 * Production bridge. Turns a catalog template plus company and department context into the exact
 * fields a real agent needs (the `agents` table columns), with the Rules injected into the
 * system role. Saturday's demo does not call a model, but this definition is what a real run uses.
 */

export interface AgentContext {
  arabicDialect: string;
  brandVoice: string;
  companyName: string;
  departmentContext: string;
  departmentName: string;
  rules: RuleSet;
}

const lines = (items: Bi[], lang: 'ar' | 'en'): string =>
  items.map((i) => `- ${i[lang]}`).join('\n');

const rulesText = (tools: ToolGrant[], ctx: AgentContext, role: 'manager' | 'specialist'): string =>
  tools.map((t) => `- ${t.label.en} (${t.id}): ${effectiveLevel(ctx.rules, t, role)}`).join('\n');

const rosterText = (template: AgentTemplate): string =>
  (template.specialistIds ?? [])
    .map((id) => getAgentTemplate(id))
    .filter((s): s is AgentTemplate => Boolean(s))
    .map((s) => `- ${s.name.en} (${s.id}): ${s.role.en}`)
    .join('\n');

export const buildSystemRole = (template: AgentTemplate, ctx: AgentContext): string => {
  if (!template.systemRole) {
    throw new Error(`${template.id} has no production system role yet (coming soon).`);
  }
  const role = template.kind === 'manager' ? 'manager' : 'specialist';
  const values: Record<string, string> = {
    APPROVAL_RULES: rulesText(template.tools, ctx, role),
    ARABIC_DIALECT: ctx.arabicDialect,
    BRAND_VOICE: ctx.brandVoice || 'Not set. Ask before writing public copy.',
    COMPANY_NAME: ctx.companyName,
    DATA_BOUNDARIES: `You may touch:\n${lines(template.data.canTouch, 'en')}\nYou must not touch:\n${lines(template.data.cannotTouch, 'en')}`,
    DEPARTMENT_CONTEXT: ctx.departmentContext || 'Not set yet.',
    DEPARTMENT_NAME: ctx.departmentName,
    SPECIALIST_ROSTER: rosterText(template),
  };
  return template.systemRole.replaceAll(
    /\{\{([A-Z_]+)\}\}/g,
    (_, key: string) => values[key] ?? '',
  );
};

/** Fields for the `agents` table (and the create-agent service). The model comes from the user. */
export interface AgentCreateInput {
  avatar: string;
  description: string;
  metadata: { departmentId?: string; kind: string; templateId: string; templateVersion: string };
  model: string | null;
  /** Builtin tool identifiers, one per tool the Rules grant. Forbidden tools are left out. */
  plugins: string[];
  provider: string | null;
  slug: string;
  systemRole: string;
  tags: string[];
  title: string;
  /** Approval mode per granted tool, for the runtime human-intervention config. */
  toolApproval: Record<string, 'auto-run' | 'allow-list' | 'manual'>;
}

export const toAgentCreateInput = (
  template: AgentTemplate,
  ctx: AgentContext,
  avatarPath: string,
): AgentCreateInput => {
  const role = template.kind === 'manager' ? 'manager' : 'specialist';
  const toolApproval: AgentCreateInput['toolApproval'] = {};
  const plugins = new Set<string>();
  for (const t of template.tools) {
    const mode = toRuntimeApprovalMode(effectiveLevel(ctx.rules, t, role));
    if (!mode) continue;
    toolApproval[t.id] = mode;
    if (t.source === 'builtin') plugins.add(t.id.split('/')[0]);
  }
  return {
    avatar: avatarPath,
    description: template.summary.en,
    metadata: {
      departmentId: template.departmentId,
      kind: template.kind,
      templateId: template.id,
      templateVersion: template.version,
    },
    // Locked model, if the department Rules lock one. Otherwise the user picks in the UI.
    model: ctx.rules.model.lock ? ctx.rules.model.modelId : null,
    plugins: [...plugins],
    provider: null,
    slug: `azzar-${template.id}`,
    systemRole: buildSystemRole(template, ctx),
    tags: [template.major, template.kind, 'azzar-template'],
    title: template.name.en,
    toolApproval,
  };
};
