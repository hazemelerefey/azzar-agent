import { TITLE_BAR_HEIGHT } from '@azzar/desktop-bridge';
import { setFloatingCollisionPadding } from '@azzar/ui';

export const reserveTitleBarForFloatingLayers = () => {
  setFloatingCollisionPadding({ top: TITLE_BAR_HEIGHT });
};
