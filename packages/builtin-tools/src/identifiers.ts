import { AcceptanceEvidenceManifest } from '@azzar/builtin-tool-acceptance-evidence';
import { AzzarActivatorManifest } from '@azzar/builtin-tool-activator';
import { AgentBuilderManifest } from '@azzar/builtin-tool-agent-builder';
import { AgentDocumentsManifest } from '@azzar/builtin-tool-agent-documents';
import { AgentManagementManifest } from '@azzar/builtin-tool-agent-management';
import {
  agentSignalFeedbackIntentManifest,
  agentSignalReflectionManifest,
  agentSignalReviewManifest,
  agentSignalSkillManagementManifest,
} from '@azzar/builtin-tool-agent-signal';
import { AttachmentsManifest } from '@azzar/builtin-tool-attachments';
import { AuvManifest } from '@azzar/builtin-tool-auv';
import { BrowserManifest } from '@azzar/builtin-tool-browser';
import { CalculatorManifest } from '@azzar/builtin-tool-calculator/manifest';
import { CanvasManifest } from '@azzar/builtin-tool-canvas';
import { CloudSandboxManifest } from '@azzar/builtin-tool-cloud-sandbox';
import { CredsManifest } from '@azzar/builtin-tool-creds';
import { DashboardManifest } from '@azzar/builtin-tool-dashboard';
import {
  GoalManifest,
  GoalReportManifest,
  GoalSupervisorManifest,
} from '@azzar/builtin-tool-goal';
import { GroupAgentBuilderManifest } from '@azzar/builtin-tool-group-agent-builder';
import { GroupManagementManifest } from '@azzar/builtin-tool-group-management';
import { ImageGenerationManifest } from '@azzar/builtin-tool-image-generation';
import { KnowledgeBaseManifest } from '@azzar/builtin-tool-knowledge-base';
import { AzzarAgentManifest } from '@azzar/builtin-tool-azzar-agent';
import { LocalSystemManifest } from '@azzar/builtin-tool-local-system';
import { MemoryManifest } from '@azzar/builtin-tool-memory';
import { NotebookManifest } from '@azzar/builtin-tool-notebook';
import { PageAgentManifest } from '@azzar/builtin-tool-page-agent';
import { selfFeedbackIntentManifest } from '@azzar/builtin-tool-self-iteration';
import { SkillStoreManifest } from '@azzar/builtin-tool-skill-store';
import { SkillsManifest } from '@azzar/builtin-tool-skills';
import { UserInteractionManifest } from '@azzar/builtin-tool-user-interaction';
import { VerifyToolManifest } from '@azzar/builtin-tool-verify';
import { VideoGenerationManifest } from '@azzar/builtin-tool-video-generation';
import { WebBrowsingManifest } from '@azzar/builtin-tool-web-browsing';
import { WebOnboardingManifest } from '@azzar/builtin-tool-web-onboarding';

export const builtinToolIdentifiers: string[] = [
  AcceptanceEvidenceManifest.identifier,
  AgentBuilderManifest.identifier,
  AgentDocumentsManifest.identifier,
  AgentManagementManifest.identifier,
  AttachmentsManifest.identifier,
  AuvManifest.identifier,
  CalculatorManifest.identifier,
  CanvasManifest.identifier,
  CloudSandboxManifest.identifier,
  CredsManifest.identifier,
  DashboardManifest.identifier,
  GroupAgentBuilderManifest.identifier,
  GroupManagementManifest.identifier,
  GoalManifest.identifier,
  GoalSupervisorManifest.identifier,
  GoalReportManifest.identifier,
  ImageGenerationManifest.identifier,
  VideoGenerationManifest.identifier,
  KnowledgeBaseManifest.identifier,
  BrowserManifest.identifier,
  LocalSystemManifest.identifier,
  MemoryManifest.identifier,
  NotebookManifest.identifier,
  PageAgentManifest.identifier,
  selfFeedbackIntentManifest.identifier,
  agentSignalReviewManifest.identifier,
  agentSignalReflectionManifest.identifier,
  agentSignalFeedbackIntentManifest.identifier,
  agentSignalSkillManagementManifest.identifier,
  SkillsManifest.identifier,
  SkillStoreManifest.identifier,
  AzzarActivatorManifest.identifier,
  WebBrowsingManifest.identifier,
  UserInteractionManifest.identifier,
  AzzarAgentManifest.identifier,
  WebOnboardingManifest.identifier,
  VerifyToolManifest.identifier,
];
