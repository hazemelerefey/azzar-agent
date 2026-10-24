'use client';

import { PromptDiffView } from '@azzar/builtin-tool-agent-builder/client';
import type { BuiltinRenderProps } from '@azzar/types';
import { memo } from 'react';

import type { UpdateAgentPromptParams, UpdateAgentPromptState } from '../../../types';

export const UpdateAgentPromptRender = memo<
  BuiltinRenderProps<UpdateAgentPromptParams, UpdateAgentPromptState>
>(({ pluginState }) => {
  if (!pluginState) return null;

  return (
    <PromptDiffView newPrompt={pluginState.newPrompt} previousPrompt={pluginState.previousPrompt} />
  );
});

UpdateAgentPromptRender.displayName = 'UpdateAgentPromptRender';

export default UpdateAgentPromptRender;
