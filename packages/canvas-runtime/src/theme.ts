import { type AzzarThemeState, setAzzarTheme } from '@azzar/ui';

declare global {
  interface Window {
    __AZZAR_CANVAS_THEME__?: Partial<AzzarThemeState>;
  }
}

const systemAppearance = () =>
  matchMedia('(prefers-color-scheme: dark)').matches ? ('dark' as const) : ('light' as const);

export const startThemeSync = () => {
  let hostTheme = window.__AZZAR_CANVAS_THEME__;

  const apply = () => {
    const appearance = hostTheme?.appearance ?? systemAppearance();
    setAzzarTheme({ ...hostTheme, appearance });
    document.documentElement.style.colorScheme = appearance;
  };

  const onTheme = (event: Event) => {
    hostTheme = (event as CustomEvent<Partial<AzzarThemeState>>).detail;
    apply();
  };
  const onSystemTheme = () => {
    if (!hostTheme?.appearance) apply();
  };
  const media = matchMedia('(prefers-color-scheme: dark)');
  window.addEventListener('azzar-canvas-theme', onTheme);
  media.addEventListener('change', onSystemTheme);

  apply();
  return () => {
    window.removeEventListener('azzar-canvas-theme', onTheme);
    media.removeEventListener('change', onSystemTheme);
  };
};
