'use client';

import type { BuiltinInspectorProps } from '@azzar/types';
import { createStaticStyles, cx } from '@azzar/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { oneLineEllipsis, shinyTextStyles } from '@/styles';

const styles = createStaticStyles(({ css, cssVar }) => ({
  done: css`
    color: ${cssVar.colorTextDescription};
  `,
}));

export const GetPageContentInspector = memo<BuiltinInspectorProps>(({ isArgumentsStreaming }) => {
  const { t } = useTranslation('plugin');

  return (
    <div className={oneLineEllipsis}>
      <span className={cx(isArgumentsStreaming ? shinyTextStyles.shinyText : styles.done)}>
        {t('builtins.azzar-page-agent.apiName.getPageContent')}
      </span>
    </div>
  );
});

GetPageContentInspector.displayName = 'GetPageContentInspector';

export default GetPageContentInspector;
