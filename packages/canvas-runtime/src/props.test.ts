import { CANVAS_COMPONENT_MAP } from '@azzar/canvas';
import { describe, expect, it } from 'vitest';

import { parseAttributeValue, readChildItems, readJsonChildren, readProps } from './props';

const host = (html: string) => {
  const container = document.createElement('div');
  container.innerHTML = html;
  return container.firstElementChild!;
};

describe('parseAttributeValue', () => {
  it('parses each schema type', () => {
    expect(parseAttributeValue({ description: '', type: 'boolean' }, 'a', '')).toBe(true);
    expect(parseAttributeValue({ description: '', type: 'boolean' }, 'a', 'false')).toBe(false);
    expect(parseAttributeValue({ description: '', type: 'number' }, 'a', '42')).toBe(42);
    expect(parseAttributeValue({ description: '', type: 'number' }, 'a', 'x')).toBeUndefined();
    expect(
      parseAttributeValue({ description: '', type: 'enum', values: ['a'] }, 'a', 'b'),
    ).toBeUndefined();
    expect(parseAttributeValue({ description: '', type: 'json' }, 'a', '[1]')).toEqual([1]);
    expect(parseAttributeValue({ description: '', type: 'json' }, 'a', '{')).toBeUndefined();
  });
});

describe('readProps', () => {
  it('prefers attributes and falls back to JSON child data', () => {
    const el = host(
      `<azzar-bar-list unit="ms"><script type="application/json" data-prop="data">[{"name":"a","value":1}]</script></azzar-bar-list>`,
    );
    const spec = CANVAS_COMPONENT_MAP.get('azzar-bar-list')!;

    expect(readProps(el, spec, readJsonChildren(el))).toEqual({
      data: [{ name: 'a', value: 1 }],
      unit: 'ms',
    });
  });
});

describe('readChildItems', () => {
  it('reads option-like children with their label and nodes', () => {
    const el = host(
      `<azzar-select value="b"><azzar-option value="a">A</azzar-option><azzar-option value="b" disabled>B</azzar-option></azzar-select>`,
    );

    expect(readChildItems(el).map(({ attrs, label, tag }) => ({ attrs, label, tag }))).toEqual([
      { attrs: { value: 'a' }, label: 'A', tag: 'azzar-option' },
      { attrs: { disabled: '', value: 'b' }, label: 'B', tag: 'azzar-option' },
    ]);
  });
});
