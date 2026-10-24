'use client';

import { memo } from 'react';

import type { IconType } from '../../types';

import { TITLE } from '../style';

const Icon: IconType = memo(({ size = '1em', style, ...rest }) => {
  return (
    <svg
      height={size}
      style={{ flex: 'none', lineHeight: 1, ...style }}
      viewBox="0 0 47.2 10"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <title>{TITLE}</title>
      <g fill="#F2F4F8">
        <polygon points="0,0 8,0 8,2.2 0,2.2" />
        <polygon points="0,3.9 8,3.9 8,6.1 0,6.1" />
        <polygon points="0,7.8 8,7.8 8,10 0,10" />
        <polygon points="5.8,0 8,0 8,10 5.8,10" />
        <polygon points="0,3.9 2.2,3.9 2.2,10 0,10" />
        <polygon points="10.2,0 18.6,0 18.6,2.2 13.3,7.8 18.6,7.8 18.6,10 10.2,10 10.2,7.8 15.5,2.2 10.2,2.2" />
        <polygon points="20.8,0 29.2,0 29.2,2.2 23.9,7.8 29.2,7.8 29.2,10 20.8,10 20.8,7.8 26.1,2.2 20.8,2.2" />
        <polygon points="31.4,0 39.4,0 39.4,2.2 31.4,2.2" />
        <polygon points="31.4,3.9 39.4,3.9 39.4,6.1 31.4,6.1" />
        <polygon points="31.4,7.8 39.4,7.8 39.4,10 31.4,10" />
        <polygon points="37.2,0 39.4,0 39.4,10 37.2,10" />
        <polygon points="31.4,3.9 33.6,3.9 33.6,10 31.4,10" />
        <polygon points="41.6,0 43.8,0 43.8,10 41.6,10" />
        <polygon points="41.6,0 47.2,0 47.2,2.2 41.6,2.2" />
      </g>
    </svg>
  );
});

export default Icon;
