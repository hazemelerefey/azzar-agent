import { fireEvent, render as rtlRender } from '@testing-library/react';
import { motion } from 'motion/react';
import type { ReactElement } from 'react';

import { MotionProvider } from '../../MotionProvider';

import Highlighter from '../Highlighter';

const render = (node: ReactElement) =>
  rtlRender(<MotionProvider motion={motion}>{node}</MotionProvider>);

describe('Highlighter stable classes', () => {
  it('exposes the full-featured expand state as data-expanded', () => {
    const { container } = render(
      <Highlighter fullFeatured language="ts">
        const a = 1;
      </Highlighter>,
    );
    const root = container.querySelector<HTMLElement>('.azzar-highlighter')!;

    expect(root.hasAttribute('data-expanded')).toBe(true);
    expect(root.dataset.variant).toBe('filled');

    fireEvent.click(container.querySelector('.azzar-highlighter__header')!);
    expect(root.hasAttribute('data-expanded')).toBe(false);
  });

  it('starts collapsed without data-expanded when defaultExpand is false', () => {
    const { container } = render(
      <Highlighter fullFeatured defaultExpand={false} language="ts">
        const a = 1;
      </Highlighter>,
    );
    expect(container.querySelector('.azzar-highlighter')?.hasAttribute('data-expanded')).toBe(false);
  });
});
