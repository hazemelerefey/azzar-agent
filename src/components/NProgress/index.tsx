'use client';

import { cssVar } from '@azzar/ui';
import NextTopLoader from 'nextjs-toploader';

import { isDesktop } from '@/const/version';

const NProgress = () => {
  return (
    !isDesktop && (
      <NextTopLoader
        color={cssVar.colorText}
        height={2}
        shadow={false}
        showSpinner={false}
        zIndex={1000}
      />
    )
  );
};

export default NProgress;
