import { AgentDocumentsIdentifier } from '@azzar/builtin-tool-agent-documents';
import { UserInteractionIdentifier } from '@azzar/builtin-tool-user-interaction';

import type { BuiltinAgentDefinition } from '../../types';
import { BUILTIN_AGENT_SLUGS } from '../../types';
import { createSystemRole } from './systemRole';

const isDefaultOrLegacySystemRole = (role?: string) => {
  if (!role || !role.trim()) return true;
  const trimmed = role.trim();
  if (trimmed === 'You are Azzar, an AI Agent will help users.') return true;
  if (
    trimmed.startsWith('You are Azzar, an AI Agent') &&
    !trimmed.includes('Chief Agent Orchestrator')
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
    const hasCustomRole =
      Boolean(ctx.storedSystemRole) && !isDefaultOrLegacySystemRole(ctx.storedSystemRole);

    return {
      plugins: [AgentDocumentsIdentifier, UserInteractionIdentifier, ...(ctx.plugins || [])],
      // A user-customized prompt wins; the runtime one is only the default.
      systemRole: hasCustomRole
        ? ctx.storedSystemRole
        : createSystemRole(ctx.userLocale, { name: ctx.agentName, title: ctx.agentTitle }),
    };
  },

  slug: BUILTIN_AGENT_SLUGS.inbox,
};
