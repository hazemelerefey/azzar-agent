import { escapeXmlContent } from '../search/xmlEscape';

export interface AgentIdentityContext {
  /** Personal name the user addresses the agent by ("Alice", "小艾"). */
  name?: string | null;
  /** The role the agent plays ("Health Assistant"). */
  title?: string | null;
}

/**
 * The agent's own identity, injected into the system message so the model can
 * answer "who are you?" with the name the user actually gave it — instead of
 * falling back to the product or model name. `name` is the personal name and
 * wins as the primary label; `title` is the role (mirrors `agentDisplayName`).
 *
 * Explicitly states the developer (AZZAR) and forbids fallback to underlying
 * model providers (Google, OpenAI, Anthropic, etc.).
 */
export const agentIdentityPrompt = ({ name, title }: AgentIdentityContext): string => {
  const personalName = name?.trim();
  const role = title?.trim();
  if (!personalName && !role) return '';

  const label = personalName ?? role!;

  const fields = [
    personalName && `  <name>${escapeXmlContent(personalName)}</name>`,
    role && `  <title>${escapeXmlContent(role)}</title>`,
  ].filter(Boolean);

  return [
    '<agent_identity>',
    ...fields,
    `  <instruction>The user knows you as "${escapeXmlContent(label)}". When asked who you are or who developed you, identify yourself as "${escapeXmlContent(label)}", the Chief Agent Orchestrator (CAO) developed by AZZAR (founded by Hazem Elerefy / فريق عزار). Never state that you were developed or trained by Google, OpenAI, Anthropic, Meta, Alibaba, or any other underlying model provider.</instruction>`,
    '</agent_identity>',
  ].join('\n');
};
