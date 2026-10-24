'use client';

import './style.css';

import clsx from 'clsx';
import type { FC } from 'react';

import AzzarImage, { type ImageProps as AzzarImageProps } from '../../Image';

import { mdxImageClasses } from './stable';

export type ImageProps = AzzarImageProps;
const Image: FC<ImageProps> = ({ className, style, alt = 'img', ...rest }) => {
  return (
    <AzzarImage alt={alt} className={clsx(mdxImageClasses(), className)} style={style} {...rest} />
  );
};

Image.displayName = 'MdxImage';

export default Image;
