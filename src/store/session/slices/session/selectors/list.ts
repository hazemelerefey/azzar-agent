import { INBOX_SESSION_ID } from '@/const/session';
import { sessionHelpers } from '@/store/session/slices/session/helpers';
import {
  type CustomSessionGroup,
  type GroupMemberWithAgent,
  type AzzarGroupSession,
  type AzzarSession,
  type AzzarSessions,
} from '@/types/session';

import { type SessionStore } from '../../../store';

const defaultSessions = (s: SessionStore): AzzarSessions => s.defaultSessions;

const pinnedSessions = (s: SessionStore): AzzarSessions => s.pinnedSessions;
const customSessionGroups = (s: SessionStore): CustomSessionGroup[] => s.customSessionGroups;

const allSessions = (s: SessionStore): AzzarSessions => s.sessions;

const getSessionById =
  (id: string) =>
  (s: SessionStore): AzzarSession =>
    sessionHelpers.getSessionById(id, allSessions(s));

const currentSession = (s: SessionStore): AzzarSession | undefined => {
  if (!s.activeId) return;

  return allSessions(s).find((i) => i.id === s.activeId);
};

const isInboxSession = (s: SessionStore) => s.activeId === INBOX_SESSION_ID;

const isCurrentSessionGroupSession = (s: SessionStore): boolean => {
  const session = currentSession(s);
  return session?.type === 'group';
};

const currentGroupAgents = (s: SessionStore): GroupMemberWithAgent[] => {
  const session = currentSession(s) as AzzarGroupSession;

  if (session && session.type !== 'group') return [];

  return session ? (session.members ?? []) : [];
};

export const sessionSelectors = {
  currentGroupAgents,
  currentSession,
  customSessionGroups,
  defaultSessions,
  getSessionById,
  isCurrentSessionGroupSession,
  isInboxSession,
  pinnedSessions,
};
