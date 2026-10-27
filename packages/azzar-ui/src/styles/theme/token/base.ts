const joinFontFamily = (fonts: string[]) =>
  fonts.map((font) => (font.includes(' ') ? `"${font}"` : font)).join(',');

const FONT_EMOJI = [
  '/* EMOJI */',
  'Apple Color Emoji',
  'Segoe UI Emoji',
  'Segoe UI Symbol',
  'Noto Color Emoji',
];

const FONT_EN = [
  'Inter',
  'Cairo',
  '-apple-system',
  'BlinkMacSystemFont',
  'Segoe UI Variable Display',
  'Segoe UI',
  'Roboto',
  'Helvetica Neue',
  'Arial',
];

const FONT_CODE = [
  'JetBrains Mono',
  'Hack',
  'ui-monospace',
  'SFMono-Regular',
  'SF Mono',
  'Menlo',
  'Cascadia Code',
  'Consolas',
  'Liberation Mono',
];

const FONT_BRAND = ['AzzarWordmark', 'Inter', 'sans-serif'];

const FALLBACK = ['/* FALLBACK */', 'ui-sans-serif', 'system-ui', 'sans-serif'];

const FALLBACK_CODE = ['/* FALLBACK */', 'monospace'];

export const baseToken = {
  borderRadius: 8,
  borderRadiusLG: 12,
  borderRadiusSM: 6,
  borderRadiusXS: 4,
  controlHeight: 36,
  fontFamily: joinFontFamily([FONT_EN, FALLBACK, FONT_EMOJI].flat()),
  fontFamilyBrand: joinFontFamily(FONT_BRAND),
  fontFamilyCode: joinFontFamily([FONT_CODE, FALLBACK_CODE, FONT_EMOJI].flat()),
};
