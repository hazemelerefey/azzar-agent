import { agentBuilderExecutor } from '@azzar/builtin-tool-agent-builder/executor';
import { agentManagementExecutor } from '@azzar/builtin-tool-agent-management/executor';
import { auvExecutor } from '@azzar/builtin-tool-auv/client/executor';
import { browserExecutor } from '@azzar/builtin-tool-browser/client/executor';
import { calculatorExecutor } from '@azzar/builtin-tool-calculator/executor';
import { cloudSandboxExecutor } from '@azzar/builtin-tool-cloud-sandbox/executor';
import { credsExecutor } from '@azzar/builtin-tool-creds/executor';
import { dashboardExecutor } from '@azzar/builtin-tool-dashboard/client/executor';
import { goalExecutor } from '@azzar/builtin-tool-goal/client/executor';
import { groupAgentBuilderExecutor } from '@azzar/builtin-tool-group-agent-builder/executor';
import { groupManagementExecutor } from '@azzar/builtin-tool-group-management/executor';
import { imageGenerationExecutor } from '@azzar/builtin-tool-image-generation/executor';
import { knowledgeBaseExecutor } from '@azzar/builtin-tool-knowledge-base/client/executor';
import { azzarAgentExecutor } from '@azzar/builtin-tool-azzar-agent/client/executor';
import { memoryExecutor } from '@azzar/builtin-tool-memory/executor';
import { taskExecutor } from '@azzar/builtin-tool-task/client/executor';
import { videoGenerationExecutor } from '@azzar/builtin-tool-video-generation/executor';

import type { IBuiltinToolExecutor } from '../types';
import {
  ampExecutor,
  claudeCodeExecutor,
  codeBuddyExecutor,
  codexExecutor,
  cursorExecutor,
  devinExecutor,
  droidExecutor,
  grokBuildExecutor,
  kimiCodeExecutor,
  openCodeExecutor,
  piExecutor,
  qoderExecutor,
  traeExecutor,
} from './heteroCli';
import { activatorExecutor } from './azzar-activator';
import { agentDocumentsExecutor } from './azzar-agent-documents';
import { attachmentsExecutor } from './azzar-attachments';
import { canvasExecutor } from './azzar-canvas';
import { messageExecutor } from './azzar-message';
import { notebookExecutor } from './azzar-notebook';
import { pageAgentExecutor } from './azzar-page-agent';
import { skillStoreExecutor } from './azzar-skill-store';
import { skillsExecutor } from './azzar-skills';
import { userInteractionExecutor } from './azzar-user-interaction';
import { webBrowsing } from './azzar-web-browsing';
import { webOnboardingExecutor } from './azzar-web-onboarding';
import { localSystemExecutorWithGitEffects } from './localSystem';

export const builtinToolExecutors = [
  // Hook-only executors for heterogeneous CLI agents —
  // observe their shell tool results via `onAfterCall` (never invoked).
  ampExecutor,
  claudeCodeExecutor,
  codeBuddyExecutor,
  codexExecutor,
  cursorExecutor,
  droidExecutor,
  devinExecutor,
  grokBuildExecutor,
  kimiCodeExecutor,
  openCodeExecutor,
  piExecutor,
  qoderExecutor,
  traeExecutor,
  agentBuilderExecutor,
  agentDocumentsExecutor,
  agentManagementExecutor,
  attachmentsExecutor,
  auvExecutor,
  calculatorExecutor,
  canvasExecutor,
  cloudSandboxExecutor,
  credsExecutor,
  groupAgentBuilderExecutor,
  groupManagementExecutor,
  goalExecutor,
  imageGenerationExecutor,
  knowledgeBaseExecutor,
  browserExecutor,
  localSystemExecutorWithGitEffects,
  memoryExecutor,
  messageExecutor,
  notebookExecutor,
  pageAgentExecutor,
  skillStoreExecutor,
  skillsExecutor,
  taskExecutor,
  dashboardExecutor,
  videoGenerationExecutor,
  activatorExecutor,
  userInteractionExecutor,
  azzarAgentExecutor,
  webOnboardingExecutor,
  webBrowsing,
] satisfies IBuiltinToolExecutor[];
