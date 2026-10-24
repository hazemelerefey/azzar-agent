import { toCssVariables } from '../css';
import { neutralColors, primaryColors } from '../customTheme';
import { createAzzarToken, type CreateAzzarTokenParams } from './createAzzarToken';
import { getGlobalCss, getThemeCss } from './themeCss';

const SURFACE_VARS = [
  '--azzar-fill-border',
  '--azzar-fill-border-strong',
  '--azzar-table-surface',
  '--azzar-table-cell-bg',
];

const parseRules = () => {
  const rules = new Map<string, Record<string, string>>();
  for (const [, selector, body] of getThemeCss().matchAll(/^([^\s@{][^{]*)\{\n([^}]*)\n\}/gm)) {
    const declarations = Object.fromEntries(
      [...body.matchAll(/^\s*(--azzar-[\w-]+): (.*);$/gm)].map(([, name, value]) => [name, value]),
    );
    rules.set(selector.trim(), declarations);
  }
  return rules;
};

const resolve = (
  rules: Map<string, Record<string, string>>,
  { appearance, neutralColor, primaryColor }: CreateAzzarTokenParams,
) => {
  const mode = appearance === 'dark' ? "[data-theme='dark']" : ":not([data-theme='dark'])";
  const vars = {
    ...rules.get(":root, [data-theme='light']"),
    ...(appearance === 'dark' ? rules.get("[data-theme='dark']") : {}),
    ...(primaryColor ? rules.get(`[data-primary-color='${primaryColor}']${mode}`) : {}),
    ...(neutralColor ? rules.get(`[data-neutral-color='${neutralColor}']${mode}`) : {}),
  };
  for (const name of ['--azzar-ring', ...SURFACE_VARS]) delete vars[name];
  return vars;
};

describe('getThemeCss', () => {
  const rules = parseRules();
  const variants = (['light', 'dark'] as const).flatMap((appearance): CreateAzzarTokenParams[] => [
    { appearance },
    ...(Object.keys(primaryColors) as (keyof typeof primaryColors)[]).map((primaryColor) => ({
      appearance,
      primaryColor,
    })),
    ...(Object.keys(neutralColors) as (keyof typeof neutralColors)[]).map((neutralColor) => ({
      appearance,
      neutralColor,
    })),
  ]);

  it.each(variants)('resolves %o to createAzzarToken', (params) => {
    expect(resolve(rules, params)).toEqual(toCssVariables(createAzzarToken(params)));
  });

  it('derives the fill-series border and table surface tokens per appearance', () => {
    const light = rules.get(":root, [data-theme='light']")!;
    const dark = rules.get("[data-theme='dark']")!;

    expect(light['--azzar-fill-border']).toBe('var(--azzar-color-fill)');
    expect(light['--azzar-fill-border-strong']).toBe(
      'color-mix(in srgb, var(--azzar-color-fill), var(--azzar-color-text) 15%)',
    );
    expect(light['--azzar-table-surface']).toBe('initial');
    expect(light['--azzar-table-cell-bg']).toBe('initial');

    expect(dark['--azzar-fill-border']).toBe('var(--azzar-color-fill-secondary)');
    expect(dark['--azzar-fill-border-strong']).toBe('var(--azzar-color-fill)');
    expect(dark['--azzar-table-surface']).toBe('var(--azzar-color-fill-quaternary)');
    expect(dark['--azzar-table-cell-bg']).toBe('transparent');
  });

  it('keeps document resets out of theme.css', () => {
    expect(getThemeCss()).not.toMatch(/^\s*(html|body|\*)\s*\{/m);
    expect(getGlobalCss()).toMatch(/^\s*body\s*\{/m);
  });

  it('gives body and nested theme scopes the root typography in the lowest layer', () => {
    const block = getThemeCss().match(
      /@layer azzar-base \{[^@]*?:where\(body, body \[data-theme\]\) \{([^}]*)\}/,
    );
    expect(block?.[1]).toContain('color: var(--azzar-color-text');
    expect(block?.[1]).toContain('font-family: var(--azzar-font-family');
    expect(block?.[1]).toContain('font-size: var(--azzar-font-size');
    expect(block?.[1]).toContain('line-height: var(--azzar-line-height');
    expect(getThemeCss()).not.toMatch(/:where\([^)]*\bhtml\b/);
  });

  it('styles links like the antd App wrapper did, in the lowest layer', () => {
    const base = getThemeCss().match(/@layer azzar-base \{([\s\S]*?)\n\}/)?.[1];

    expect(base).toMatch(
      /:where\(body\) :where\(a\) \{[^}]*color: var\(--azzar-color-link\);[^}]*text-decoration: none;/,
    );
    expect(base).toMatch(/:where\(body\) :where\(a\):hover \{[^}]*var\(--azzar-color-link-hover\)/);
  });

  it('ships the antd reset in global.css without fighting the root typography', () => {
    const globalCss = getGlobalCss();
    const body = globalCss.match(/\n {2}body \{([^}]*)\}/)?.[1];

    expect(body).toBeDefined();
    expect(body).not.toMatch(/(^|\s)(line-height|font-size|font-family|color):/);
    expect(globalCss).toMatch(
      /input,\s*button,\s*select,\s*optgroup,\s*textarea \{[^}]*font-family: inherit;/,
    );
    expect(globalCss).toMatch(/h1,\s*h2,\s*h3,\s*h4,\s*h5,\s*h6 \{[^}]*margin-block: 0 0\.5em;/);
    expect(globalCss).toMatch(/\[hidden\] \{\s*display: none !important;/);
  });

  it('orders the azzar layers so components beat popup and base helpers', () => {
    const order = '@layer azzar-base, azzar-popup, azzar-ui;';
    expect(getThemeCss().startsWith(order)).toBe(true);
    expect(getGlobalCss().startsWith(order)).toBe(true);
    expect(getGlobalCss()).toMatch(/@layer azzar-base \{\n\s*:root/);
  });
});
