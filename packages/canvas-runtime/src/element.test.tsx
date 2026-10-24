import { CANVAS_COMPONENT_MAP } from '@azzar/canvas';
import { act } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { defineCanvasElement } from './element';
import { type CanvasHostRoot, createHostRoot } from './host';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let hosts: CanvasHostRoot | undefined;
const getHosts = () => {
  hosts ??= createHostRoot({ onError: vi.fn(), wrap: (children) => children });
  return hosts;
};

const define = (tag: string, view: Parameters<typeof defineCanvasElement>[1]) =>
  customElements.define(tag, defineCanvasElement(CANVAS_COMPONENT_MAP.get(tag)!, view, getHosts));

beforeAll(() => {
  define('azzar-card', ({ props, slot }) => (
    <section data-title={props.title as string}>
      <span data-azzar-canvas-slot="" ref={slot} />
    </section>
  ));
  define('azzar-segmented', ({ change, items, value }) => (
    <div data-value={String(value)}>
      {items.map((item) => (
        <button key={item.attrs.value} type="button" onClick={() => change(item.attrs.value)}>
          {item.label}
        </button>
      ))}
    </div>
  ));
  define('azzar-tag', ({ props, slot }) => (
    <em data-color={props.color as string}>
      <span data-azzar-canvas-slot="" ref={slot} />
    </em>
  ));
});

afterEach(() => {
  document.body.querySelectorAll('main').forEach((node) => node.remove());
});

const mount = async (html: string) => {
  const main = document.createElement('main');
  main.innerHTML = html;
  await act(async () => {
    document.body.append(main);
  });
  return main;
};

describe('canvas elements', () => {
  it('renders every element through one shared React root and keeps light-DOM children', async () => {
    const main = await mount(
      '<azzar-card title="Cost"><p>Body <azzar-tag color="green">ok</azzar-tag></p></azzar-card><azzar-tag>second</azzar-tag>',
    );

    expect(document.querySelectorAll('[data-azzar-canvas-root]')).toHaveLength(1);
    expect(main.querySelector('section')?.dataset.title).toBe('Cost');
    expect(main.querySelector('section p')?.textContent).toBe('Body ok');
    expect(main.querySelector('azzar-card azzar-tag em')?.getAttribute('data-color')).toBe('green');
    expect(main.querySelectorAll('em')).toHaveLength(2);
  });

  it('reads option children as data and fires azzar-change with the new value', async () => {
    const main = await mount(
      '<azzar-segmented value="a"><azzar-option value="a">A</azzar-option><azzar-option value="b">B</azzar-option></azzar-segmented>',
    );
    const listener = vi.fn();
    main.addEventListener('azzar-change', (event) => listener((event as CustomEvent).detail));

    expect(main.querySelector('azzar-option')).toBeNull();
    await act(async () => {
      main.querySelectorAll('button')[1].click();
    });

    expect(listener).toHaveBeenCalledWith({ checked: false, value: 'b' });
    expect(main.querySelector('[data-value]')?.getAttribute('data-value')).toBe('b');
  });

  it('re-renders on attribute changes and stops rendering once removed', async () => {
    const main = await mount('<azzar-card title="Old"></azzar-card>');
    const card = main.querySelector('azzar-card')!;

    await act(async () => {
      card.setAttribute('title', 'New');
    });
    expect(main.querySelector('section')?.dataset.title).toBe('New');

    await act(async () => {
      card.remove();
    });
    expect(card.querySelector('section')).toBeNull();
  });
});
