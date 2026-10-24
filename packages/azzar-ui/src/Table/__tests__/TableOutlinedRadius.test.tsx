import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(__dirname, '../style.css'), 'utf8');

const blockOf = (selector: string) => {
  const start = css.indexOf(`\n  ${selector}`);
  expect(start).toBeGreaterThan(-1);
  const next = css.indexOf('\n  .azzar-table.', start + selector.length);
  return css.slice(start, next === -1 ? undefined : next);
};

describe('Table outlined / filled rounded corners', () => {
  for (const variant of ['outlined', 'filled']) {
    it(`gives ${variant} corner cells the container radius`, () => {
      const block = blockOf(`.azzar-table.azzar-table-${variant} {`);
      expect(block).toMatch(/--azzar-table-radius-top:/);
      expect(block).toMatch(/--azzar-table-radius-bottom:/);
      expect(block).toMatch(/--azzar-table-radius-top:\s*0px/);
      expect(block).toMatch(/--azzar-table-radius-bottom:\s*0px/);
      expect(block).toMatch(
        /thead > tr:first-child > :first-child\s*\{\s*border-start-start-radius/,
      );
      expect(block).toMatch(/thead > tr:first-child > :last-child\s*\{\s*border-start-end-radius/);
      expect(block).toMatch(/tbody > tr:last-child > :first-child\s*\{\s*border-end-start-radius/);
      expect(block).toMatch(/tbody > tr:last-child > :last-child\s*\{\s*border-end-end-radius/);
    });
  }

  it('uses the inner radius (outer minus the 1px frame) for outlined', () => {
    expect(blockOf('.azzar-table.azzar-table-outlined {')).toMatch(
      /--azzar-table-radius-top:\s*calc\(var\(--azzar-border-radius-lg\) - 1px\)/,
    );
  });
});
