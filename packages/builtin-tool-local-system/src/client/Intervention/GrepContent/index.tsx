import { type GrepContentParams } from '@azzar/electron-client-ipc';
import { type BuiltinInterventionProps } from '@azzar/types';
import { Flexbox, Highlighter } from '@azzar/ui';
import { Text } from '@azzar/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { LocalFolder } from '@/features/LocalFile';

import OutOfScopeWarning from '../OutOfScopeWarning';

const GrepContent = memo<BuiltinInterventionProps<GrepContentParams>>(({ args }) => {
  const { t } = useTranslation('tool');
  const { pattern, scope, glob, type } = args;

  return (
    <Flexbox gap={12}>
      <OutOfScopeWarning paths={scope ? [scope] : []} />
      {scope && <LocalFolder path={scope} />}
      <Flexbox gap={4}>
        <Text type="secondary">{t('localFiles.grepContent.pattern')}</Text>
        <Highlighter language="regex" showLanguage={false} variant="outlined">
          {pattern}
        </Highlighter>
      </Flexbox>
      {glob && (
        <Text style={{ fontSize: 12 }} type="secondary">
          {t('localFiles.grepContent.glob')}: {glob}
        </Text>
      )}
      {type && (
        <Text style={{ fontSize: 12 }} type="secondary">
          {t('localFiles.grepContent.type')}: {type}
        </Text>
      )}
    </Flexbox>
  );
});

GrepContent.displayName = 'GrepContentIntervention';

export default GrepContent;
