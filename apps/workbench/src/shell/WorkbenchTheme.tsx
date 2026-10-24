'use client';

import '@azzar/ui/theme.css';
import '@azzar/ui/global.css';
import '@azzar/ui/style.css';

import ConfigProvider from '@azzar/ui/es/ConfigProvider/index';
import { domMax, LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';
import { memo, type PropsWithChildren } from 'react';

import Image from '@/libs/next/Image';
import Link from '@/libs/next/Link';

const WorkbenchTheme = memo<PropsWithChildren>(({ children }) => {
  return (
    <ConfigProvider config={{ aAs: Link, imgAs: Image, imgUnoptimized: true }} motion={m}>
      <div
        className={'workbench-layout'}
        style={{ height: '100%', minHeight: '100dvh', width: '100%' }}
      >
        <LazyMotion features={domMax}>{children}</LazyMotion>
      </div>
    </ConfigProvider>
  );
});

WorkbenchTheme.displayName = 'WorkbenchTheme';

export default WorkbenchTheme;
