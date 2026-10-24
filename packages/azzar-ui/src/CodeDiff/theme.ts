import type { FileDiffOptions } from '@pierre/diffs';
import { registerCustomTheme, resolveTheme } from '@pierre/diffs';

import azzarTheme from '../Highlighter/theme/azzar-theme';
import { cssVar } from '../styles/stylex/cssVar.stylex';

import type { DiffViewMode } from './type';

let isAzzarDiffThemeRegistered = false;

export const registerAzzarDiffThemes = () => {
  if (isAzzarDiffThemeRegistered) return;

  registerCustomTheme('azzar-theme', () => Promise.resolve(azzarTheme as any));
  void resolveTheme('azzar-theme');

  isAzzarDiffThemeRegistered = true;
};

const customSeparatorCSS = `
  :host {
    --diffs-dark-bg: transparent !important;
    --diffs-light-bg: transparent !important;
    --diffs-gap-fallback: 8px;
    --diffs-added-light: ${cssVar.colorSuccessHover};
    --diffs-added-dark: ${cssVar.colorSuccessBorderHover};
    --diffs-modified-light: ${cssVar.colorInfoHover};
    --diffs-modified-dark: ${cssVar.colorInfoBorderHover};
    --diffs-deleted-light: ${cssVar.colorErrorHover};
    --diffs-deleted-dark: ${cssVar.colorErrorBorderHover};
  }

  [data-gutter-buffer] {
    opacity: 0.2 !important;
  }

  [data-code] {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }

  [data-gutter] {
    backdrop-filter: blur(16px) !important;
  }
`;

export const getAzzarDiffOptions = ({
  diffOptions,
  isDarkMode,
  viewMode,
}: {
  diffOptions?: FileDiffOptions<string, undefined>;
  isDarkMode: boolean;
  viewMode: DiffViewMode;
}): FileDiffOptions<string, undefined> => ({
  theme: {
    dark: 'azzar-theme',
    light: 'azzar-theme',
  },
  themeType: isDarkMode ? 'dark' : 'light',
  diffStyle: viewMode,
  disableFileHeader: true,
  unsafeCSS: customSeparatorCSS,
  ...diffOptions,
});
