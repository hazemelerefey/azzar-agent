import { ConfigProvider } from '@azzar/ui';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';

// The canvas CSP only allows same-origin fonts, so azzar-ui's CDN webfonts would be blocked.
export const wrapCanvasTree = (children: ReactNode) => (
  <ConfigProvider enableCustomFonts={false} motion={motion}>
    {children}
  </ConfigProvider>
);
