'use client';

import clsx from 'clsx';
import { type FC } from 'react';

import Img from '../../Img';
import type { ImgProps } from '../../types';
import { brandLogo3dClasses } from './stable';

type Logo3dProps = Omit<ImgProps, 'width' | 'height'> & {
  size?: number | string;
};

const Logo3d: FC<Logo3dProps> = ({
  size = '1em',
  className,
  style,
  alt = 'AZZAR',
  src = '/icons/logo-3d.webp',
  ...rest
}) => {
  return (
    <Img
      alt={alt}
      className={clsx(brandLogo3dClasses(), className)}
      height={size}
      src={src}
      style={style}
      width={size}
      {...rest}
    />
  );
};

Logo3d.displayName = 'AZZARLogo3d';

export default Logo3d;
