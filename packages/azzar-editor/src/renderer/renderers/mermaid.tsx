'use client';

import { Mermaid } from '@azzar/ui';
import { type ReactNode } from 'react';

export function renderMermaidBlock(node: Record<string, any>, key: string): ReactNode {
  const code = (node.code as string) || '';
  return (
    <Mermaid
      animated={false}
      defaultExpand
      fullFeatured
      key={key}
      style={{ width: '100%' }}
      theme="azzar-theme"
      variant="filled"
    >
      {code}
    </Mermaid>
  );
}
