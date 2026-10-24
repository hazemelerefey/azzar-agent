import { createGlobalStyle } from '@azzar/ui';

import global from './global';

const prefixCls = 'ant';

export const GlobalStyle = createGlobalStyle(({ theme }) => [global({ prefixCls, token: theme })]);

export { shinyTextStyles } from './loading';
export * from './text';
