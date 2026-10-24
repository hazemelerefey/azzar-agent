import type {
  AzzarChatGroupChatConfig,
  AzzarChatGroupFullConfig,
  AzzarChatGroupMetaConfig,
} from '@azzar/types';

export const DEFAULT_CHAT_GROUP_CHAT_CONFIG: AzzarChatGroupChatConfig = {
  allowDM: true,
  openingMessage: '',
  openingQuestions: [],
  revealDM: false,
  systemPrompt: '',
};

export const DEFAULT_CHAT_GROUP_META_CONFIG: AzzarChatGroupMetaConfig = {
  description: '',
  title: '',
};

export const DEFAULT_CHAT_GROUP_CONFIG: AzzarChatGroupFullConfig = {
  chat: DEFAULT_CHAT_GROUP_CHAT_CONFIG,
  meta: DEFAULT_CHAT_GROUP_META_CONFIG,
};
