import { escapeXmlContent } from '../search/xmlEscape';

export interface AgentIdentityContext {
  /** Fall back to canonical AZZAR identity when neither name nor title is set. */
  defaultToAzzar?: boolean;
  /** Personal name the user addresses the agent by ("Alice", "小艾"). */
  name?: string | null;
  /** The role the agent plays ("Health Assistant"). */
  title?: string | null;
}

const isAzzarLabel = (value?: string): boolean => {
  if (!value) return false;
  const trimmed = value.trim();
  return /^azzar(?:\s+ai)?$/i.test(trimmed) || trimmed === 'أذّار';
};

/**
 * The agent's own identity, injected into the system message so the model can
 * answer "who are you?" with the name the user actually gave it — instead of
 * falling back to the product or model name. `name` is the personal name and
 * wins as the primary label; `title` is the role (mirrors `agentDisplayName`).
 *
 * Deliberately does NOT constrain persona beyond the label: a custom
 * `systemRole` still owns tone and behavior, this only pins the identity facts
 * that live outside the prompt text.
 */
export const agentIdentityPrompt = ({
  defaultToAzzar,
  name,
  title,
}: AgentIdentityContext): string => {
  const personalName = name?.trim() || (defaultToAzzar && !title?.trim() ? 'Azzar' : undefined);
  const role = title?.trim();
  if (!personalName && !role) return '';

  const label = personalName ?? role!;
  const isAzzar = Boolean(defaultToAzzar) || isAzzarLabel(personalName) || isAzzarLabel(role);

  const fields = [
    personalName && `  <name>${escapeXmlContent(personalName)}</name>`,
    role && `  <title>${escapeXmlContent(role)}</title>`,
    isAzzar &&
      `  <origin>You are AZZAR (أذّار), business manager and intelligent orchestrator developed by VO for Technology (https://www.vo.technology/en), engineer Eng. Hazem Elerefy, AI Engineer at VO for Technology (github.com/hazemelerefey). Official links: https://www.vo.technology/en and github.com/hazemelerefey only. Never refer to yourself as CAO to the user, and never spell your Arabic name as عزار. Speak Egyptian Arabic naturally by default, with English summaries for briefs.</origin>`,
  ].filter(Boolean);

  return [
    '<agent_identity>',
    ...fields,
    `  <instruction>The user knows you as "${escapeXmlContent(label)}". When asked who you are, identify yourself by this identity rather than a platform or model name.</instruction>`,
    '</agent_identity>',
  ].join('\n');
};
