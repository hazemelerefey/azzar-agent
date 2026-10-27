import { describe, expect, it } from 'vitest';

import { genFontFamily } from './font';

describe('genFontFamily', () => {
  it('includes Inter and Cairo as primary font families', () => {
    const stack = genFontFamily();

    expect(stack.indexOf('Inter')).toBe(0);
    expect(stack.indexOf('Cairo')).toBe(6);
    expect(stack).not.toContain('HarmonyOS Sans SC');
    expect(stack).not.toContain('PingFang SC');
  });

  it('includes japanese families for ja-JP', () => {
    const stack = genFontFamily({ locale: 'ja-JP' });

    expect(stack.indexOf('"Hiragino Sans"')).toBeGreaterThan(-1);
    expect(stack).not.toContain('HarmonyOS Sans SC');
  });

  it('puts the user font first, then the env custom font', () => {
    const stack = genFontFamily({
      customFontFamily: 'Env Font',
      locale: 'en-US',
      userFontFamily: ' Custom Font ',
    });

    expect(stack.startsWith('"Custom Font","Env Font",Inter,Cairo')).toBe(true);
  });

  it('leaves an already composed font-family list untouched', () => {
    expect(
      genFontFamily({ customFontFamily: 'Foo, "Bar Baz"' }).startsWith(
        'Foo, "Bar Baz",Inter,Cairo',
      ),
    ).toBe(true);
  });
});
