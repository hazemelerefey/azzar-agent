import { toCssVariables, toCssVarName } from '../css';
import { neutralColors, primaryColors } from '../customTheme';
import { createAzzarTokenGroups } from './createAzzarToken';
import { isCustomNeutral } from './customNeutral';
import { isRegisteredPalette } from './customPalette';
import type { CustomPrimaryColor } from './customPrimary';
import type { AzzarAppearance } from './scope';

const v = (key: string) => `var(${toCssVarName(key)})`;

const ring: Record<AzzarAppearance, string> = {
  dark: '0 0 0 1px rgb(255 255 255 / 18%)',
  light: '0 0 0 1px rgb(0 0 0 / 5%)',
};

/* `initial` makes a light scope nested in a dark one fall back to each variant's own fill
   instead of inheriting the dark table surface. */
const surface: Record<AzzarAppearance, Record<string, string>> = {
  dark: {
    '--azzar-fill-border': v('colorFillSecondary'),
    '--azzar-fill-border-strong': v('colorFill'),
    '--azzar-table-cell-bg': 'transparent',
    '--azzar-table-surface': v('colorFillQuaternary'),
  },
  light: {
    '--azzar-fill-border': v('colorFill'),
    '--azzar-fill-border-strong': `color-mix(in srgb, ${v('colorFill')}, ${v('colorText')} 15%)`,
    '--azzar-table-cell-bg': 'initial',
    '--azzar-table-surface': 'initial',
  },
};

const rule = (selector: string, declarations: Record<string, number | string>) =>
  `${selector} {\n${Object.entries(declarations)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n')}\n}`;

const appearanceRule = (selector: string, appearance: AzzarAppearance) => {
  const { neutral, palette, primary, static: base } = createAzzarTokenGroups({ appearance });
  const token =
    appearance === 'light'
      ? { ...base, ...palette, ...primary, ...neutral }
      : { ...palette, ...primary, ...neutral };

  return rule(selector, {
    ...toCssVariables(token),
    '--azzar-ring': ring[appearance],
    ...surface[appearance],
    'color-scheme': appearance,
  });
};

const appearanceSelector = (appearance: AzzarAppearance) =>
  appearance === 'dark' ? "[data-theme='dark']" : ":not([data-theme='dark'])";

const colorRules = (appearance: AzzarAppearance) => [
  ...(Object.keys(primaryColors) as (keyof typeof primaryColors)[]).map((primaryColor) =>
    rule(
      `[data-primary-color='${primaryColor}']${appearanceSelector(appearance)}`,
      toCssVariables(createAzzarTokenGroups({ appearance, primaryColor }).primary),
    ),
  ),
  ...(Object.keys(neutralColors) as (keyof typeof neutralColors)[]).map((neutralColor) =>
    rule(
      `[data-neutral-color='${neutralColor}']${appearanceSelector(appearance)}`,
      toCssVariables(createAzzarTokenGroups({ appearance, neutralColor }).neutral),
    ),
  ),
];

export const getCustomPrimaryCss = (color: CustomPrimaryColor) => {
  const hex = color.toLowerCase();
  return (['light', 'dark'] as const)
    .map((appearance) =>
      rule(
        `[data-primary-color='${hex}']${appearanceSelector(appearance)}`,
        toCssVariables(
          createAzzarTokenGroups({ appearance, primaryColor: hex as CustomPrimaryColor }).primary,
        ),
      ),
    )
    .join('\n\n');
};

/** CSS for a custom neutral (6-digit hex or a `registerAzzarNeutral` name); '' for presets. */
export const getCustomNeutralCss = (value: string) => {
  const key = value.startsWith('#') ? value.toLowerCase() : value;
  if (!isCustomNeutral(key)) return '';
  return (['light', 'dark'] as const)
    .map((appearance) =>
      rule(
        `[data-neutral-color='${key}']${appearanceSelector(appearance)}`,
        toCssVariables(createAzzarTokenGroups({ appearance, neutralColor: key }).neutral),
      ),
    )
    .join('\n\n');
};

export const getCustomPaletteCss = (name: string) => {
  if (!isRegisteredPalette(name)) return '';
  return (['light', 'dark'] as const)
    .map((appearance) => {
      const { neutral, palette } = createAzzarTokenGroups({ appearance, palette: name });
      return rule(
        `[data-palette='${name}']${appearanceSelector(appearance)}`,
        toCssVariables({
          ...palette,
          colorErrorOutline: neutral.colorErrorOutline,
          colorWarningOutline: neutral.colorWarningOutline,
        }),
      );
    })
    .join('\n\n');
};

/**
 * The outline tokens depend on both the neutral and the status palette, so the standalone
 * neutral / palette stylesheets each compute them against the other's default. This rule
 * (higher specificity) recomputes them for the actual combination.
 */
export const getPaletteNeutralCss = (name: string, neutralColor: string) => {
  if (!isRegisteredPalette(name) || !neutralColor) return '';
  const key = neutralColor.startsWith('#') ? neutralColor.toLowerCase() : neutralColor;
  return (['light', 'dark'] as const)
    .map((appearance) => {
      const { neutral } = createAzzarTokenGroups({ appearance, neutralColor: key, palette: name });
      return rule(
        `[data-palette='${name}'][data-neutral-color='${key}']${appearanceSelector(appearance)}`,
        toCssVariables({
          colorErrorOutline: neutral.colorErrorOutline,
          colorWarningOutline: neutral.colorWarningOutline,
        }),
      );
    })
    .join('\n\n');
};

const essentialCss = `@layer azzar-ui {
  .azzar-brand-loading path {
    fill: currentcolor;
    fill-opacity: 0;
    stroke: currentcolor;
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    stroke-width: 0.25em;

    animation:
      draw 2s cubic-bezier(0.4, 0, 0.2, 1) infinite,
      fill 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }
}

@layer azzar-popup {
  .azzar-context-trigger[data-popup-open],
  .azzar-dropdown-menu-trigger[data-popup-open] {
    background: ${v('colorFillTertiary')};
  }
}

@layer azzar-base {
  :where(body, body [data-theme]) {
    color: ${v('colorText')};
    font-family: ${v('fontFamily')};
    font-size: ${v('fontSize')};
    line-height: ${v('lineHeight')};
  }

  :where(body) :where(a) {
    cursor: pointer;

    color: ${v('colorLink')};
    text-decoration: none;

    background-color: transparent;
    outline: none;

    transition: color ${v('motionDurationSlow')};
  }

  :where(body) :where(a):hover {
    color: ${v('colorLinkHover')};
  }

  :where(body) :where(a):active {
    color: ${v('colorLinkActive')};
  }

  :where(body) :where(a):focus-visible {
    outline: ${v('lineWidthFocus')} solid ${v('colorPrimaryBorder')};
    outline-offset: 1px;
  }

  :where(body) :where(a)[disabled] {
    cursor: not-allowed;
    color: ${v('colorTextDisabled')};
  }

  :where(.azzar-flex) {
    --azzar-flex: 0 1 auto;
    --azzar-flex-direction: column;
    --azzar-flex-wrap: nowrap;
    --azzar-flex-justify: flex-start;
    --azzar-flex-align: stretch;
    --azzar-flex-width: auto;
    --azzar-flex-height: auto;
    --azzar-flex-padding: 0;
    --azzar-flex-padding-inline: var(--azzar-flex-padding);
    --azzar-flex-padding-block: var(--azzar-flex-padding);
    --azzar-flex-gap: 0;

    display: flex;
    flex: var(--azzar-flex);
    flex-flow: var(--azzar-flex-direction) var(--azzar-flex-wrap);
    gap: var(--azzar-flex-gap);
    align-items: var(--azzar-flex-align);
    justify-content: var(--azzar-flex-justify);

    width: var(--azzar-flex-width);
    height: var(--azzar-flex-height);
    padding: var(--azzar-flex-padding);
    padding-block: var(--azzar-flex-padding-block);
    padding-inline: var(--azzar-flex-padding-inline);
  }

  .azzar-flex-hidden {
    display: none;
  }
}

@keyframes draw {
  0% {
    stroke-dashoffset: 1000;
  }

  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes fill {
  30% {
    fill-opacity: 0.05;
  }

  100% {
    fill-opacity: 1;
  }
}`;

const globalCss = `@layer azzar-base {
  :root {
    --font-settings: 'cv01', 'tnum', 'kern';
    --font-variations: 'opsz' auto, tabular-nums;

    font-synthesis: style;
    text-autospace: normal;
  }

  html {
    overscroll-behavior: none;
  }

  body {
    overflow: hidden auto;

    min-height: 100vh;
    margin: 0;
    padding: 0;

    font-feature-settings: var(--font-settings);
    font-variation-settings: var(--font-variations);
    font-optical-sizing: auto;
    font-kerning: normal;
    font-variant-ligatures: common-ligatures contextual;
    font-variant-numeric: tabular-nums;
    font-size-adjust: from-font;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-wrap: pretty;
    text-size-adjust: 100%;
    text-rendering: optimizelegibility;
    overflow-wrap: anywhere;
    vertical-align: baseline;

    background-color: ${v('colorBgLayout')};

    font-synthesis: style;

    -webkit-overflow-scrolling: touch;
    -webkit-tap-highlight-color: transparent;
  }

  html,
  body {
    width: 100%;
    height: 100%;
  }

  [tabindex='-1']:focus {
    outline: none;
  }

  [hidden] {
    display: none !important;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-block: 0 0.5em;
    font-weight: 500;
  }

  p,
  ol,
  ul,
  dl,
  pre {
    margin-block: 0 1em;
  }

  ol ol,
  ul ul,
  ol ul,
  ul ol {
    margin-block-end: 0;
  }

  dd {
    margin-block-end: 0.5em;
    margin-inline-start: 0;
  }

  blockquote,
  figure {
    margin-block: 0 1em;
    margin-inline: 0;
  }

  img {
    border-style: none;
    vertical-align: middle;
  }

  table {
    border-collapse: collapse;
  }

  input,
  button,
  select,
  optgroup,
  textarea {
    margin: 0;

    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    color: inherit;
  }

  textarea {
    resize: vertical;
    overflow: auto;
  }

  fieldset {
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }

  code,
  kbd,
  samp,
  pre {
    font-family: ${v('fontFamilyCode')} !important;
    font-feature-settings:
      'liga' 0,
      'calt' 0;
    font-variant-ligatures: none;

    span {
      font-family: ${v('fontFamilyCode')} !important;
    }
  }

  ::selection {
    color: #000;
    background: ${v('yellow9')};

    -webkit-text-fill-color: unset !important;
  }

  * {
    scrollbar-color: ${v('colorFill')} transparent;
    scrollbar-width: thin;
    box-sizing: border-box;
    vertical-align: baseline;
  }
}`;

const layerOrder = '@layer azzar-base, azzar-popup, azzar-ui;';

let cached: string | undefined;

export const getThemeCss = () =>
  (cached ??= [
    layerOrder,
    appearanceRule(":root, [data-theme='light']", 'light'),
    appearanceRule("[data-theme='dark']", 'dark'),
    ...colorRules('light'),
    ...colorRules('dark'),
    essentialCss,
  ].join('\n\n'));

export const getGlobalCss = () => `${layerOrder}\n\n${globalCss}`;
