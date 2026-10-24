import { type CSSProperties, memo, useEffect, useId, useRef, useState } from 'react';

import { loadCanvasAddon } from '../addons/load';
import type { CanvasMermaidMount } from '../addons/registry';
import { normalizeCodeText } from '../codeText';
import type { CanvasView } from '../element';

const SERIES = ['blue', 'gold', 'green', 'red', 'purple', 'cyan', 'orange', 'magenta'];

// Same mapping azzar-ui's Mermaid uses for its default theme, so diagrams follow the app theme.
const PELE_THEME = {
  '--pele-accent': 'var(--azzar-color-primary)',
  '--pele-bg': 'var(--azzar-color-bg-container)',
  '--pele-border': 'var(--azzar-color-border)',
  '--pele-critical': 'var(--azzar-color-error)',
  '--pele-error': 'var(--azzar-color-error)',
  '--pele-fg': 'var(--azzar-color-text)',
  '--pele-font': 'var(--azzar-font-family)',
  '--pele-font-mono': 'var(--azzar-font-family-code)',
  '--pele-line': 'var(--azzar-color-text-secondary)',
  '--pele-muted': 'var(--azzar-color-text-description)',
  '--pele-radius': 'var(--azzar-border-radius)',
  '--pele-surface': 'var(--azzar-color-fill-tertiary)',
  '--pele-surface-alt': 'var(--azzar-color-fill-secondary)',
  ...Object.fromEntries(
    SERIES.map((color, index) => [`--pele-series-${index + 1}`, `var(--azzar-${color})`]),
  ),
} as CSSProperties;

const reportDiagramError = (message: string) =>
  window.dispatchEvent(
    new CustomEvent('azzar-canvas-component-error', { detail: { message, tag: 'azzar-mermaid' } }),
  );

const MermaidDiagram = memo<{ source: string }>(({ source }) => {
  const reactId = useId();
  const idPrefix = `azzar-mermaid-${reactId.replaceAll(':', '')}-`;
  const container = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let live = true;
    let mounted: CanvasMermaidMount | undefined;
    setError(undefined);

    const fail = (message: string) => {
      if (!live) return;
      setError(message);
      reportDiagramError(message);
    };

    loadCanvasAddon('mermaid')
      .then((addon) => {
        if (!live || !container.current) return;
        mounted = addon.mount(container.current, source, idPrefix);
        if (mounted.error) fail(mounted.error);
      })
      .catch((reason: unknown) => fail(reason instanceof Error ? reason.message : String(reason)));

    return () => {
      live = false;
      mounted?.destroy();
    };
  }, [source, idPrefix]);

  if (error)
    return (
      <pre data-azzar-canvas-mermaid-fallback="">
        <code>{source}</code>
      </pre>
    );

  return <div data-azzar-canvas-mermaid="" ref={container} style={PELE_THEME} />;
});

MermaidDiagram.displayName = 'CanvasMermaidDiagram';

export const mermaidViews: Record<string, CanvasView> = {
  'azzar-mermaid': ({ text }) => <MermaidDiagram source={normalizeCodeText(text)} />,
};
