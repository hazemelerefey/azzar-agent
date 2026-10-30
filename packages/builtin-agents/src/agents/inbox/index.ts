import { AgentDocumentsIdentifier } from '@azzar/builtin-tool-agent-documents';
import { UserInteractionIdentifier } from '@azzar/builtin-tool-user-interaction';

import type { BuiltinAgentDefinition } from '../../types';
import { BUILTIN_AGENT_SLUGS } from '../../types';
import { AZZAR_IDENTITY_BLOCK, createSystemRole } from './systemRole';

const isDefaultOrLegacySystemRole = (role?: string) => {
  if (!role || !role.trim()) return true;
  const trimmed = role.trim();
  if (trimmed === 'You are Azzar, an AI Agent will help users.') return true;
  if (
    trimmed.startsWith('You are Azzar, an AI Agent') &&
    (!trimmed.includes('AZZAR (أذّار)') || trimmed.includes('Chief Agent Orchestrator'))
  ) {
    return true;
  }
  return false;
};

/**
 * Inbox Agent - the default assistant agent for general conversations
 *
 * Note: model and provider are intentionally undefined to use user's default settings
 */
export const INBOX: BuiltinAgentDefinition = {
  avatar: '/avatars/azzar-ai.png',
  runtime: (ctx) => {
    const defaultRole = createSystemRole(ctx.userLocale, {
      name: ctx.agentName,
      title: ctx.agentTitle,
    });
    const stored = ctx.storedSystemRole?.trim();
    const isCustomRole = Boolean(stored) && !isDefaultOrLegacySystemRole(stored);
    const isAzzarAgent = !ctx.agentName?.trim() || /^azzar(?:\s+ai)?$/i.test(ctx.agentName.trim());

    const systemRole = isCustomRole
      ? isAzzarAgent && !stored!.includes('AZZAR (أذّار)')
        ? `${AZZAR_IDENTITY_BLOCK.trim()}\n\n${stored}`
        : stored!
      : defaultRole;

    return {
      plugins: [AgentDocumentsIdentifier, UserInteractionIdentifier, ...(ctx.plugins || [])],
      systemRole,
    };
  },

  slug: BUILTIN_AGENT_SLUGS.inbox,
};
