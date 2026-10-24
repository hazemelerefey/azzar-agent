'use client';

import { type AZZARProps } from '@azzar/ui/brand';
import { AZZAR } from '@azzar/ui/brand';
import { memo } from 'react';

import { isCustomBranding } from '@/const/version';

import CustomLogo from './Custom';

interface ProductLogoProps extends AZZARProps {
  height?: number;
  width?: number;
}

export const ProductLogo = memo<ProductLogoProps>((props) => {
  if (isCustomBranding) {
    return <CustomLogo {...props} />;
  }

  return <AZZAR {...props} />;
});
