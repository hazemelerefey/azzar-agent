import { createStaticStyles } from '@azzar/ui';

export const styles = createStaticStyles(({ css, cssVar }) => ({
  // Main container
  mainContainer: css`
    position: relative;
    overflow: hidden;
    background: ${cssVar.colorBgContainer};
  `,
}));
