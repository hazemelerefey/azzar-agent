'use client';

import type { BuiltinInspectorProps } from '@azzar/types';
import { Text } from '@azzar/ui';
import { cssVar, cx } from '@azzar/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { inspectorTextStyles, shinyTextStyles } from '@/styles';

import type { ListWorkspaceMembersParams, ListWorkspaceMembersState } from '../../../types';

export const ListWorkspaceMembersInspector = memo<
  BuiltinInspectorProps<ListWorkspaceMembersParams, ListWorkspaceMembersState>
>(({ isArgumentsStreaming, isLoading, pluginState }) => {
  const { t } = useTranslation('plugin');
  const count = pluginState?.count;

  return (
    <div
      className={cx(
        inspectorTextStyles.root,
        (isArgumentsStreaming || isLoading) && shinyTextStyles.shinyText,
      )}
    >
      <span>{t('builtins.azzar-task.apiName.listWorkspaceMembers')}</span>
      {typeof count === 'number' && (
        <Text code as={'span'} color={cssVar.colorTextSecondary} fontSize={12}>
          {count}
        </Text>
      )}
    </div>
  );
});

ListWorkspaceMembersInspector.displayName = 'ListWorkspaceMembersInspector';

export default ListWorkspaceMembersInspector;
