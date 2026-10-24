import { colorScales, primary } from '../../../color/colors';

import {
  generatePrimaryScale,
  isCustomPrimaryColor,
  type AzzarPrimaryColor,
} from '../customPrimary';
import { generateColorPalette } from '../generateColorPalette';

const resolveScale = (primaryColor?: AzzarPrimaryColor) => {
  if (isCustomPrimaryColor(primaryColor)) return generatePrimaryScale(primaryColor);
  return (primaryColor && colorScales[primaryColor]) || primary;
};

export const createPrimaryToken = (
  appearance: 'light' | 'dark',
  primaryColor?: AzzarPrimaryColor,
) => {
  const token = generateColorPalette({
    appearance,
    scale: resolveScale(primaryColor),
    type: 'Primary',
  });

  return {
    ...token,
    controlItemBgActive: token.colorPrimaryBg,
    controlItemBgActiveHover: token.colorPrimaryBgHover,
  };
};
