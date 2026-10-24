'use client';

import { memo } from 'react';

import type { IconType } from '../../types';

import { TITLE } from '../style';

const Icon: IconType = memo(({ size = '1em', style, ...rest }) => {
  return (
    <svg
      height={size}
      style={{ flex: 'none', lineHeight: 1, ...style }}
      viewBox="0 0 92 92"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <title>{TITLE}</title>
      <polygon points="0,0 92,0 92,20 0,20" fill="#F2F4F8" />
      <polygon points="53.5,24 87.5,24 71.9,38 37.9,38" fill="#F2F4F8" />
      <polygon points="33.5,42 67.5,42 54.1,54 20.1,54" fill="#F2F4F8" />
      <polygon points="15.7,58 49.7,58 38.5,68 4.5,68" fill="#F2F4F8" />
      <polygon points="0,72 68,72 68,92 0,92" fill="#F2F4F8" />
      <circle cx="82" cy="82" r="10" fill="#00F0A0" />
    </svg>
  );
});

export default Icon;
