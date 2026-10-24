import type { BuiltinSkillManifest } from '@azzar/types';

import { AgentBrowserManifest } from './agent-browser/manifest';
import { ArtifactsManifest } from './artifacts/manifest';
import { AZZARManifest } from './azzar/manifest';
import { TaskManifest } from './task/manifest';

export { AgentBrowserIdentifier } from './agent-browser/manifest';
export { ArtifactsIdentifier } from './artifacts/manifest';
export { AZZARIdentifier } from './azzar/manifest';
export { TaskIdentifier } from './task/manifest';

export const builtinSkillManifests: BuiltinSkillManifest[] = [
  AgentBrowserManifest,
  ArtifactsManifest,
  AZZARManifest,
  TaskManifest,
];
