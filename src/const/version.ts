import { BRANDING_NAME, ORG_NAME } from '@azzar/business-const';

import pkg from '../../package.json';

export const CURRENT_VERSION = pkg.version;

export const isDesktop = typeof __ELECTRON__ !== 'undefined' && !!__ELECTRON__;

export const isCustomBranding = BRANDING_NAME !== 'AZZAR';
export const isCustomORG = ORG_NAME !== 'AZZAR';
