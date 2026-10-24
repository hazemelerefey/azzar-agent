'use client';

import { cx } from '@azzar/ui';
import { type FC, useLayoutEffect } from 'react';

import { useLexicalComposerContext } from '../../../editor-kernel/react/react-context';
import { MarkdownPlugin } from '../../markdown/plugin';

import { CodeblockPlugin } from '../plugin';
import { styles } from './style';
import type { ReactCodeblockPluginProps } from './type';

export const ReactCodeblockPlugin: FC<ReactCodeblockPluginProps> = ({ theme, shikiTheme }) => {
  const [editor] = useLexicalComposerContext();
  const codeStyle = cx(styles.code);

  useLayoutEffect(() => {
    editor.registerPlugin(MarkdownPlugin);
    editor.registerPlugin(CodeblockPlugin, {
      shikiTheme: shikiTheme || 'azzar-theme',
      theme: theme || { code: styles.code },
    });
  }, [codeStyle, editor, shikiTheme, theme]);

  return null;
};

ReactCodeblockPlugin.displayName = 'ReactCodeblockPlugin';

export default ReactCodeblockPlugin;
