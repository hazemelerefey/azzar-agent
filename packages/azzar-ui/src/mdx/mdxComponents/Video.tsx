'use client';

import './style.css';

import clsx from 'clsx';
import type { FC } from 'react';

import AzzarVideo, { type VideoProps as AzzarVideoProps } from '../../Video';

import { mdxVideoClasses } from './stable';

export type VideoProps = AzzarVideoProps;

const toLength = (value?: number | string) =>
  typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value;

const Video: FC<VideoProps> = ({ className, height, style, width, ...rest }) => {
  return (
    <AzzarVideo
      className={clsx(mdxVideoClasses(), className)}
      height={toLength(height)}
      style={style}
      width={toLength(width)}
      {...rest}
    />
  );
};

Video.displayName = 'MdxVideo';

export default Video;
