'use client';

import type { BuiltinInspectorProps } from '@azzar/types';
import { Icon } from '@azzar/ui';
import { createStaticStyles, cx } from '@azzar/ui';
import { CheckCircle2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { inspectorTextStyles, shinyTextStyles } from '@/styles';

const styles = createStaticStyles(({ css, cssVar }) => ({
  done: css`
    color: ${cssVar.colorSuccess};
  `,
}));

export const FinishOnboardingInspector = memo<
  BuiltinInspectorProps<Record<string, never>, Record<string, unknown>>
>(({ isArgumentsStreaming, isLoading, result }) => {
  const { t } = useTranslation('plugin');
  const succeeded = !!result && !result.error;

  return (
    <div className={inspectorTextStyles.root} style={{ gap: 6 }}>
      <span className={cx((isArgumentsStreaming || isLoading) && shinyTextStyles.shinyText)}>
        {t('builtins.azzar-web-onboarding.apiName.finishOnboarding')}
      </span>
      {succeeded && <Icon className={styles.done} icon={CheckCircle2} size={14} />}
    </div>
  );
});

FinishOnboardingInspector.displayName = 'FinishOnboardingInspector';

export default FinishOnboardingInspector;
