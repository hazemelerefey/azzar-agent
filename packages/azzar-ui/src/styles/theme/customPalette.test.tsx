import { act, render, screen } from '@testing-library/react';

import { statusColorScales } from '../../color/status';
import type { ColorScaleItem } from '../../color/types';

import { createAzzarToken } from './createAzzarToken';
import { registerAzzarNeutral } from './customNeutral';
import { registerAzzarPalette } from './customPalette';
import { AzzarThemeScript, setAzzarTheme, ThemeScope, useTheme } from './scope';
import { getCustomPaletteCss, getPaletteNeutralCss } from './themeCss';

const shade = (hex: string): ColorScaleItem['light'] =>
  Array.from({ length: 13 }, () => hex) as ColorScaleItem['light'];

const scaleOf = (hex: string): ColorScaleItem => ({
  dark: shade(hex),
  darkA: shade(hex),
  light: shade(hex),
  lightA: shade(hex),
});

const Probe = () => {
  const theme = useTheme();
  return <span data-testid="probe">{`${theme.colorError}|${theme.colorWarning}`}</span>;
};

afterEach(() => {
  for (const name of ['data-theme', 'data-palette', 'data-neutral-color'])
    document.documentElement.removeAttribute(name);
  for (const style of document.querySelectorAll('style[id^="azzar-palette-"]')) style.remove();
});

describe('custom status palette', () => {
  it('replaces only the registered statuses in the tokens', () => {
    registerAzzarPalette('acme', { error: scaleOf('#aa0033') });

    const light = createAzzarToken({ appearance: 'light', palette: 'acme' });
    expect(light.colorError).toBe('#aa0033');
    expect(light.colorErrorText).toBe('#aa0033');
    expect(light.colorHighlight).toBe('#aa0033');
    expect(light.colorWarning).toBe(statusColorScales.warning.light[9]);
    expect(createAzzarToken({ appearance: 'dark', palette: 'acme' }).colorError).toBe('#aa0033');
  });

  it('falls back to the default palette for an unknown name', () => {
    expect(createAzzarToken({ appearance: 'light', palette: 'missing' })).toEqual(
      createAzzarToken({ appearance: 'light' }),
    );
    expect(getCustomPaletteCss('missing')).toBe('');
  });

  it('rejects names that cannot be used in a selector', () => {
    expect(() => registerAzzarPalette("x'] *{", {})).toThrow();
  });

  it('emits light and dark rules for the palette', () => {
    registerAzzarPalette('acme', { error: scaleOf('#aa0033') });

    const css = getCustomPaletteCss('acme');
    expect(css).toContain(`[data-palette='acme']:not([data-theme='dark'])`);
    expect(css).toContain(`[data-palette='acme'][data-theme='dark']`);
    expect(css).toContain('--azzar-color-error: #aa0033;');
    expect(css).toContain('--azzar-color-error-outline:');
    expect(css).not.toContain('--azzar-color-primary:');
  });

  it('useTheme follows data-palette written by setAzzarTheme', async () => {
    registerAzzarPalette('acme', { error: scaleOf('#aa0033') });
    render(<Probe />);

    await act(async () => setAzzarTheme({ palette: 'acme' }));

    expect(document.documentElement.dataset.palette).toBe('acme');
    expect(document.querySelectorAll('style#azzar-palette-acme')).toHaveLength(1);
    expect(screen.getByTestId('probe').textContent).toBe(
      `#aa0033|${statusColorScales.warning.light[9]}`,
    );
  });

  it('picks up a re-registered palette', async () => {
    registerAzzarPalette('acme', { error: scaleOf('#aa0033') });
    render(<Probe />);
    await act(async () => setAzzarTheme({ palette: 'acme' }));

    await act(async () => {
      registerAzzarPalette('acme', { warning: scaleOf('#ff8800') });
      setAzzarTheme({ palette: 'acme' });
    });

    expect(screen.getByTestId('probe').textContent).toBe(
      `${statusColorScales.error.light[9]}|#ff8800`,
    );
    expect(document.querySelector('style#azzar-palette-acme')?.textContent).toContain('#ff8800');
  });

  it('a scope sets the palette for its subtree', () => {
    registerAzzarPalette('acme', { error: scaleOf('#aa0033') });
    render(
      <ThemeScope palette="acme">
        <Probe />
      </ThemeScope>,
    );

    const probe = screen.getByTestId('probe');
    expect(probe.textContent).toBe(`#aa0033|${statusColorScales.warning.light[9]}`);
    expect(probe.parentElement?.dataset.palette).toBe('acme');
  });

  it('the theme script writes the attribute and the palette stylesheet', () => {
    registerAzzarPalette('acme', { error: scaleOf('#aa0033') });
    const { container } = render(<AzzarThemeScript palette="acme" />);

    const script = container.querySelector('script')?.innerHTML ?? '';
    expect(script).toContain('data-palette');
    expect(script).toContain('azzar-palette-acme');
    expect(script).toContain('--azzar-color-error: #aa0033;');
  });

  it('computes outlines for the neutral + palette combination', () => {
    registerAzzarPalette('acme', { error: scaleOf('#aa0033') });

    const css = getPaletteNeutralCss('acme', '#0E1010');
    const dark = createAzzarToken({ appearance: 'dark', neutralColor: '#0e1010', palette: 'acme' });
    expect(css).toContain(`[data-palette='acme'][data-neutral-color='#0e1010'][data-theme='dark']`);
    expect(css).toContain(`--azzar-color-error-outline: ${dark.colorErrorOutline};`);
    expect(css).toContain(`--azzar-color-warning-outline: ${dark.colorWarningOutline};`);
    expect(getPaletteNeutralCss('missing', '#0e1010')).toBe('');
  });

  it('setAzzarTheme injects the combination stylesheet', async () => {
    registerAzzarPalette('acme', { error: scaleOf('#aa0033') });
    registerAzzarNeutral('foundry', scaleOf('#0e1010'));
    await act(async () => setAzzarTheme({ neutralColor: 'foundry', palette: 'acme' }));

    expect(document.getElementById('azzar-palette-acme--neutral-name-foundry')).not.toBeNull();
  });
});
