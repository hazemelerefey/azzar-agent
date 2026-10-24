import { createStaticStyles } from '@azzar/ui';

export const styles = createStaticStyles(
  ({ css, cssVar }) => css`
    cursor: pointer;

    display: flex;
    align-items: center;

    width: 100%;
    height: calc(var(--azzar-markdown-margin-multiple) * 1em);
    margin-block: calc(var(--azzar-markdown-margin-multiple) * 1em);
    border-radius: ${cssVar.borderRadiusSM};

    hr {
      width: 100%;
      border-color: ${cssVar.colorBorder};
      border-style: dashed;
      border-width: 1px;
      border-block-start: none;
      border-inline-start: none;
      border-inline-end: none;
    }

    &.selected {
      outline: 2px solid ${cssVar.yellow};
      outline-offset: 0;
    }
  `,
);
