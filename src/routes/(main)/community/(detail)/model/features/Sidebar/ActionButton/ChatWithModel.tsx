'use client';

import { Button, createStaticStyles, DropdownMenu, SplitButton } from '@azzar/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import urlJoin from 'url-join';

import { ProviderIcon } from '@/components/AzzarIcons';
import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';
import WorkspaceLink from '@/features/Workspace/WorkspaceLink';

import { useDetailContext } from '../../DetailProvider';

const styles = createStaticStyles(({ css }) => ({
  button: css`
    button {
      width: 100%;
    }
  `,
}));

const ChatWithModel = memo(() => {
  const { t } = useTranslation('discover');
  const { providers = [] } = useDetailContext();
  const includeAZZAR = providers.some((item) => item.id === 'azzar');
  const navigate = useWorkspaceAwareNavigate();
  const list = providers.filter((provider) => provider.id !== 'azzar');

  const items = list.map((item) => ({
    icon: <ProviderIcon provider={item.id} size={20} type={'avatar'} />,
    key: item.id,
    label: (
      <WorkspaceLink to={urlJoin('/community/provider', item.id)}>
        {[item.name, t('models.guide')].join(' ')}
      </WorkspaceLink>
    ),
  }));

  const handleAZZARChat = () => {
    navigate('/agent');
  };

  if (includeAZZAR)
    return (
      <SplitButton size={'large'} style={{ flex: 1, width: 'unset' }} type={'primary'}>
        <SplitButton.Main style={{ flex: 1 }} onClick={handleAZZARChat}>
          {t('models.chat')}
        </SplitButton.Main>
        <SplitButton.Menu items={items} popupProps={{ style: { minWidth: 267 } }} />
      </SplitButton>
    );

  if (items.length === 1)
    return (
      <WorkspaceLink style={{ flex: 1 }} to={urlJoin('/community/provider', items[0].key)}>
        <Button block className={styles.button} size={'large'} type={'primary'}>
          {t('models.guide')}
        </Button>
      </WorkspaceLink>
    );

  return (
    <DropdownMenu data-no-highlight items={items}>
      <Button
        className={styles.button}
        size={'large'}
        style={{ flex: 1, width: 'unset' }}
        type={'primary'}
      >
        {t('models.guide')}
      </Button>
    </DropdownMenu>
  );
});

export default ChatWithModel;
