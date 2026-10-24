import './style.css';

import * as stylex from '@stylexjs/stylex';

export const styles = {
  chat: 'azzar-markdown-chat',
  gfm: 'azzar-markdown-gfm',
  latex: 'azzar-markdown-latex',
};

export const rootStyles = stylex.create({
  root: {
    overflow: 'hidden',
    position: 'relative',
    maxWidth: '100%',
  },
});
