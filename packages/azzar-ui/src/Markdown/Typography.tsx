'use client';

import './style.css';

import clsx from 'clsx';
import { type CSSProperties, memo } from 'react';

import { styleProps } from '../styles/stylex/props';

import { typographyClasses } from './stable';
import type { TypographyProps } from './type';

export const TypographyImpl = ({
  ref,
  children,
  className,
  fontSize,
  headerMultiple,
  marginMultiple,
  lineHeight,
  borderRadius,
  style,
  xstyle,
  ...rest
}: TypographyProps & { xstyle?: Parameters<typeof styleProps>[0] }) => {
  return (
    <article
      ref={ref}
      {...styleProps(xstyle, clsx('azzar-markdown', typographyClasses(), className), {
        ...(borderRadius === undefined
          ? undefined
          : { '--azzar-markdown-border-radius': borderRadius }),
        ...(fontSize === undefined ? undefined : { '--azzar-markdown-font-size': `${fontSize}px` }),
        ...(headerMultiple === undefined
          ? undefined
          : { '--azzar-markdown-header-multiple': headerMultiple }),
        ...(lineHeight === undefined ? undefined : { '--azzar-markdown-line-height': lineHeight }),
        ...(marginMultiple === undefined
          ? undefined
          : { '--azzar-markdown-margin-multiple': marginMultiple }),
        ...style,
      } as CSSProperties)}
      {...rest}
    >
      {children}
    </article>
  );
};

const Typography = memo<TypographyProps>((props) => <TypographyImpl {...props} />);

Typography.displayName = 'Typography';

export default Typography;
