import { describe, expect, it } from 'vitest';

import { bem, stableClasses, toDataAttributes } from './bem';

describe('bem', () => {
  it('prefixes the block with the azzar- namespace', () => {
    expect(bem('slider').block).toBe('azzar-slider');
    expect(bem('slider')()).toBe('azzar-slider');
  });

  it('appends an element with the BEM separator', () => {
    expect(bem('draggable-panel')('handle')).toBe('azzar-draggable-panel__handle');
    expect(bem('alert')('icon')).toBe('azzar-alert__icon');
  });

  it('falls back to the block when the element is empty', () => {
    expect(bem('slider')('')).toBe('azzar-slider');
  });

  it('caches one factory per block', () => {
    expect(bem('slider')).toBe(bem('slider'));
    expect(bem('slider')).not.toBe(bem('switch'));
  });
});

describe('stableClasses', () => {
  const switchClasses = stableClasses({ block: 'switch', elements: ['thumb'] });

  it('builds the block and its declared elements', () => {
    expect(switchClasses()).toBe('azzar-switch');
    expect(switchClasses('thumb')).toBe('azzar-switch__thumb');
    expect(switchClasses.block).toBe('azzar-switch');
  });

  it('exposes the manifest for docs and tests', () => {
    expect(switchClasses.elements).toEqual(['thumb']);
    expect(switchClasses.dataAttributes).toEqual([]);
    expect(
      stableClasses({ block: 'button', dataAttributes: ['variant'], elements: [] }).dataAttributes,
    ).toEqual(['variant']);
  });

  it('rejects undeclared elements at the type level', () => {
    // @ts-expect-error 'track' is not a declared element
    expect(switchClasses('track')).toBe('azzar-switch__track');
  });
});

describe('toDataAttributes', () => {
  it('maps enum values, keeps true as an empty attribute and drops false or empty values', () => {
    expect(
      toDataAttributes({
        expanded: undefined,
        glass: false,
        level: 2,
        shadow: true,
        size: 'small',
        variant: 'filled',
      }),
    ).toEqual({
      'data-level': '2',
      'data-shadow': '',
      'data-size': 'small',
      'data-variant': 'filled',
    });
  });

  it('converts camelCase keys to kebab-case attribute names', () => {
    expect(toDataAttributes({ iconPosition: 'end' })).toEqual({ 'data-icon-position': 'end' });
  });
});
