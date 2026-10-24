import '@azzar/ui/theme.css';
import '@azzar/ui/style.css';
import './base.css';

import { CANVAS_COMPONENTS } from '@azzar/canvas';

import { defineCanvasElement } from './element';
import { type CanvasHostRoot, createHostRoot } from './host';
import { wrapCanvasTree } from './providers';
import { startThemeSync } from './theme';
import { baseViews } from './views/base';
import { chartViews } from './views/charts';
import { codeViews } from './views/code';
import { mermaidViews } from './views/mermaid';

const views = { ...baseViews, ...chartViews, ...codeViews, ...mermaidViews };

const reportError = (error: unknown, host: HTMLElement) => {
  console.error('[azzar-canvas]', error);
  window.dispatchEvent(
    new CustomEvent('azzar-canvas-component-error', {
      detail: {
        message: error instanceof Error ? error.message : String(error),
        tag: host.tagName.toLowerCase(),
      },
    }),
  );
};

if (typeof window !== 'undefined' && !customElements.get('azzar-flex')) {
  const stopThemeSync = startThemeSync();

  let hosts: CanvasHostRoot | undefined;
  let disposed = false;
  const getHosts = () => {
    hosts ??= createHostRoot({
      onError: reportError,
      wrap: wrapCanvasTree,
    });
    if (disposed) hosts.destroy();
    return hosts;
  };

  window.addEventListener(
    'azzar-canvas-dispose',
    () => {
      disposed = true;
      stopThemeSync();
      hosts?.destroy();
    },
    { once: true },
  );

  for (const spec of CANVAS_COMPONENTS) {
    customElements.define(
      spec.tag,
      defineCanvasElement(spec, views[spec.tag] ?? (() => null), getHosts),
    );
  }

  document.dispatchEvent(new CustomEvent('azzar-canvas:ready'));
}
