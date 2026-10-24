'use client';

import { AZZAR_THEME_APP_ID } from '@azzar/ui';
import { useMemo } from 'react';

import { useLexicalComposerContext } from './react-context';

export const useAnchor = () => {
  const [editor] = useLexicalComposerContext();
  // Don't render portal on server side

  return useMemo(() => {
    if (typeof document === 'undefined' || !editor) return;
    const root = editor.getRootElement();
    const anchor = root ? root.parentElement : null;
    if (anchor) return anchor;
    const app = document.querySelector(`#${AZZAR_THEME_APP_ID}`) as HTMLElement;
    return app || document.body;
  }, [editor]);
};
