import { createStaticStyles } from '@azzar/ui';

export const styles = createStaticStyles(
  ({ css, cssVar }) => css`
    background: ${cssVar.colorBgElevated};
  `,
);
