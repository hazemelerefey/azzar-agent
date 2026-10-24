'use client';

import { STREAM_FADE_DURATION } from '@azzar/streamdown';
import clsx from 'clsx';
import { type CSSProperties, memo } from 'react';

import { styleProps } from '../../styles/stylex/props';
import { toDataAttributes } from '../../utils/bem';

import type { SyntaxHighlighterProps } from '../type';
import StaticRenderer from './StaticRenderer';
import StreamRenderer from './StreamRenderer';
import { styles } from './style';

type SyntaxHighlighterImplProps = SyntaxHighlighterProps & {
  xstyle?: Parameters<typeof styleProps>[0];
};

export const SyntaxHighlighterImpl = memo<SyntaxHighlighterImplProps>(
  ({
    animated,
    children,
    className,
    enableTransformer,
    language,
    style,
    theme,
    variant = 'borderless',
    xstyle,
  }) => {
    const isDefaultTheme = theme === 'azzar-theme' || !theme;
    const showBackground = !isDefaultTheme && variant === 'filled';
    const resolvedTheme = isDefaultTheme ? undefined : theme;

    const classes = clsx(
      'azzar-syntax-highlighter',
      !showBackground && 'azzar-syntax-highlighter-transparent',
      animated && 'azzar-syntax-highlighter-animated',
      variant === 'borderless'
        ? 'azzar-syntax-highlighter-unpadded'
        : 'azzar-syntax-highlighter-padded',
    );
    const mergedStyle = animated
      ? ({
          '--azzar-syntax-highlighter-stream-fade': `${STREAM_FADE_DURATION}ms`,
          ...style,
        } as CSSProperties)
      : style;

    const dataAttributes = toDataAttributes({ animated, variant });
    const shiki = styleProps(
      [styles.root, xstyle],
      clsx(classes, 'azzar-syntax-highlighter-shiki', className),
      mergedStyle,
    );
    const fallback = styleProps(
      [styles.root, styles.unshiki, xstyle],
      clsx(classes, className),
      mergedStyle,
    );

    const Renderer = animated ? StreamRenderer : StaticRenderer;

    return (
      <Renderer
        className={shiki.className}
        dataAttributes={dataAttributes}
        enableTransformer={enableTransformer}
        fallbackClassName={fallback.className}
        language={language}
        style={shiki.style}
        theme={resolvedTheme}
      >
        {children}
      </Renderer>
    );
  },
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children && prevProps.language === nextProps.language,
);

const SyntaxHighlighter = memo<SyntaxHighlighterProps>((props) => (
  <SyntaxHighlighterImpl {...props} />
));

SyntaxHighlighter.displayName = 'SyntaxHighlighter';

export default SyntaxHighlighter;
