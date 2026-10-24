import { type BuiltinSkill } from '@azzar/types';

import { systemPrompt } from './content';
import { ArtifactsIdentifier, ArtifactsManifest } from './manifest';

export { ArtifactsIdentifier };

/**  Superseded by Canvas (`azzar-canvas`); kept so existing conversations keep rendering. */
export const ArtifactsSkill: BuiltinSkill = {
  ...ArtifactsManifest,
  content: systemPrompt,
};
