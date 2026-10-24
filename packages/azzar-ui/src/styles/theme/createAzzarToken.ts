import type { AzzarNeutralColor } from './customNeutral';
import { resolveStatusScales } from './customPalette';
import type { AzzarPrimaryColor } from './customPrimary';
import { createNeutralToken } from './token/neutral';
import { createPaletteToken } from './token/palette';
import { createPrimaryToken } from './token/primary';
import { staticToken } from './token/static';

export interface CreateAzzarTokenParams {
  appearance: 'light' | 'dark';
  neutralColor?: AzzarNeutralColor;
  palette?: string;
  primaryColor?: AzzarPrimaryColor;
}

export const createAzzarTokenGroups = ({
  appearance,
  neutralColor,
  palette: paletteName,
  primaryColor,
}: CreateAzzarTokenParams) => {
  const palette = createPaletteToken(appearance, resolveStatusScales(paletteName));

  return {
    neutral: createNeutralToken(appearance, neutralColor, palette),
    palette,
    primary: createPrimaryToken(appearance, primaryColor),
    static: staticToken,
  };
};

export type AzzarTokenGroups = ReturnType<typeof createAzzarTokenGroups>;

export type AzzarToken = AzzarTokenGroups['static'] &
  AzzarTokenGroups['palette'] &
  AzzarTokenGroups['primary'] &
  AzzarTokenGroups['neutral'];

export const createAzzarToken = (params: CreateAzzarTokenParams): AzzarToken => {
  const groups = createAzzarTokenGroups(params);

  return { ...groups.static, ...groups.palette, ...groups.primary, ...groups.neutral };
};
