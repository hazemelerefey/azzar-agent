'use client';

import { DEFAULT_AVATAR } from '@azzar/const';
import type { BuiltinInspectorProps } from '@azzar/types';
import { Flexbox } from '@azzar/ui';
import { Avatar } from '@azzar/ui';
import { createStaticStyles, cx, useTheme } from '@azzar/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { highlightTextStyles, shinyTextStyles } from '@/styles';

import type { CallAgentParams } from '../../../types';

const styles = createStaticStyles(({ css, cssVar }) => ({
  root: css`
    overflow: hidden;
    display: flex;
    gap: 8px;
    align-items: center;
  `,
  title: css`
    flex-shrink: 0;
    color: ${cssVar.colorTextSecondary};
    white-space: nowrap;
  `,
}));

export const CallAgentInspector = memo<BuiltinInspectorProps<CallAgentParams>>(
  ({ args, partialArgs, isArgumentsStreaming }) => {
    const { t } = useTranslation('plugin');
    const theme = useTheme();

    const agentId = args?.agentId || partialArgs?.agentId;

    // Get agent meta from store
    const agentMeta = useAgentStore((s) =>
      agentId ? agentSelectors.getAgentMetaById(agentId)(s) : undefined,
    );

    if (isArgumentsStreaming && !agentId) {
      return (
        <div className={styles.root}>
          <span className={shinyTextStyles.shinyText}>
            {t('builtins.azzar-agent-management.apiName.callAgent')}
          </span>
        </div>
      );
    }

    const agentName = agentMeta?.title || agentId;

    return (
      <Flexbox horizontal align={'center'} className={styles.root} gap={8}>
        <span className={cx(styles.title, isArgumentsStreaming && shinyTextStyles.shinyText)}>
          {t('builtins.azzar-agent-management.inspector.callAgent.sync')}
        </span>
        {agentMeta && (
          <Avatar
            avatar={agentMeta.avatar || DEFAULT_AVATAR}
            background={agentMeta.backgroundColor || theme.colorBgContainer}
            shape={'square'}
            size={24}
            title={agentMeta.title || undefined}
          />
        )}
        {agentName && <span className={highlightTextStyles.primary}>{agentName}</span>}
      </Flexbox>
    );
  },
);

CallAgentInspector.displayName = 'CallAgentInspector';

export default CallAgentInspector;
