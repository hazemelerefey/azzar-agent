'use client';

import type { BuiltinStreamingProps } from '@azzar/types';
import { Highlighter } from '@azzar/ui';
import { memo } from 'react';

interface RunCommandParams {
  command?: string;
  description?: string;
  timeout?: number;
}

export const RunCommandStreaming = memo<BuiltinStreamingProps<RunCommandParams>>(({ args }) => {
  const { command } = args || {};

  // Don't render if no command yet
  if (!command) return null;

  return (
    <Highlighter
      animated
      wrap
      language={'sh'}
      showLanguage={false}
      style={{ padding: '4px 8px' }}
      variant={'outlined'}
    >
      {command}
    </Highlighter>
  );
});

RunCommandStreaming.displayName = 'RunCommandStreaming';
