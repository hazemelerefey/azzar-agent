'use client';

import { type CSSProperties, memo, useState } from 'react';

import { Flexbox } from '../../Flex';
import Img from '../../Img';
import Spline, { type SplineProps } from '../../spline/Spline';

export interface LogoThreeProps extends Partial<SplineProps> {
  className?: string;
  size?: number;
  style?: CSSProperties;
}

const LogoThree = memo<LogoThreeProps>(({ className, style, size = 128, onLoad, ...rest }) => {
  const [loading, setLoading] = useState(true);
  return (
    <Flexbox
      align={'center'}
      className={className}
      flex={'none'}
      justify={'center'}
      style={{ height: size, overflow: 'hidden', position: 'relative', width: size, ...style }}
    >
      {loading && (
        <Img
          alt={'logo'}
          height={size * 0.75}
          src={'/icons/logo-3d.webp'}
          style={{ position: 'absolute' }}
          width={size * 0.75}
        />
      )}
      <Spline
        scene={'// AZZAR_TODO: host our own spline asset'}
        style={{
          flex: 'none',
          height: size,
          width: size,
        }}
        onLoad={(splineApp) => {
          setLoading(false);
          onLoad?.(splineApp);
        }}
        {...rest}
      />
    </Flexbox>
  );
});

LogoThree.displayName = 'AZZARLogoThree';

export default LogoThree;
