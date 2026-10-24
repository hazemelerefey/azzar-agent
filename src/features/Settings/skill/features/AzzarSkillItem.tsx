'use client';

import { type AzzarSkillProviderType } from '@azzar/const';
import {
  Avatar,
  Button,
  Button as AzzarButton,
  Center,
  confirmModal,
  cssVar,
  DropdownMenu,
  Flexbox,
  Icon,
  Tooltip,
} from '@azzar/ui';
import { CircleCheck, MoreHorizontalIcon, SquareArrowOutUpRight, Unplug } from 'lucide-react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import NavItem from '@/features/NavPanel/components/NavItem';
import { createAzzarSkillDetailModal } from '@/features/SkillStore/SkillDetail';
import { usePermission } from '@/hooks/usePermission';
import { useToolStore } from '@/store/tool';
import { type AzzarSkillServer } from '@/store/tool/slices/azzarSkillStore/types';
import { AzzarSkillStatus } from '@/store/tool/slices/azzarSkillStore/types';

import { styles } from './style';

const POLL_INTERVAL_MS = 1000;
const POLL_TIMEOUT_MS = 15_000;

interface AzzarSkillItemProps {
  isSelected?: boolean;
  onDelete?: () => void;
  onSelect?: () => void;
  provider: AzzarSkillProviderType;
  server?: AzzarSkillServer;
}

const AzzarSkillItem = memo<AzzarSkillItemProps>(
  ({ provider, server, isSelected, onSelect, onDelete }) => {
    const { t } = useTranslation('setting');
    const { allowed: canCreate, reason: createReason } = usePermission('create_content');
    const { allowed: canEdit, reason: editReason } = usePermission('edit_own_content');
    const [isConnecting, setIsConnecting] = useState(false);
    const [isWaitingAuth, setIsWaitingAuth] = useState(false);

    const oauthWindowRef = useRef<Window | null>(null);
    const windowCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const checkStatus = useToolStore((s) => s.checkAzzarSkillStatus);
    const revokeConnect = useToolStore((s) => s.revokeAzzarSkill);
    const getAuthorizeUrl = useToolStore((s) => s.getAzzarSkillAuthorizeUrl);

    const cleanup = useCallback(() => {
      if (windowCheckIntervalRef.current) {
        clearInterval(windowCheckIntervalRef.current);
        windowCheckIntervalRef.current = null;
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }
      oauthWindowRef.current = null;
      setIsWaitingAuth(false);
    }, []);

    useEffect(() => {
      return () => {
        cleanup();
      };
    }, [cleanup]);

    useEffect(() => {
      if (server?.status === AzzarSkillStatus.CONNECTED && isWaitingAuth) {
        cleanup();
      }
    }, [server?.status, isWaitingAuth, cleanup]);

    const startFallbackPolling = useCallback(() => {
      if (pollIntervalRef.current) return;

      pollIntervalRef.current = setInterval(async () => {
        try {
          await checkStatus(provider.id);
        } catch (error) {
          console.error('[AzzarSkill] Failed to check status:', error);
        }
      }, POLL_INTERVAL_MS);

      pollTimeoutRef.current = setTimeout(() => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        setIsWaitingAuth(false);
      }, POLL_TIMEOUT_MS);
    }, [checkStatus, provider.id]);

    const startWindowMonitor = useCallback(
      (oauthWindow: Window) => {
        windowCheckIntervalRef.current = setInterval(async () => {
          try {
            if (oauthWindow.closed) {
              if (windowCheckIntervalRef.current) {
                clearInterval(windowCheckIntervalRef.current);
                windowCheckIntervalRef.current = null;
              }
              oauthWindowRef.current = null;
              await checkStatus(provider.id);
              setIsWaitingAuth(false);
            }
          } catch {
            console.info(
              '[AzzarSkill] COOP blocked window.closed access, falling back to polling',
            );
            if (windowCheckIntervalRef.current) {
              clearInterval(windowCheckIntervalRef.current);
              windowCheckIntervalRef.current = null;
            }
            startFallbackPolling();
          }
        }, 500);
      },
      [checkStatus, provider.id, startFallbackPolling],
    );

    const openOAuthWindow = useCallback(
      (authorizeUrl: string) => {
        cleanup();
        setIsWaitingAuth(true);

        const oauthWindow = window.open(authorizeUrl, '_blank', 'width=600,height=700');
        if (oauthWindow) {
          oauthWindowRef.current = oauthWindow;
          startWindowMonitor(oauthWindow);
        } else {
          startFallbackPolling();
        }
      },
      [cleanup, startWindowMonitor, startFallbackPolling],
    );

    useEffect(() => {
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (
          event.data?.type === 'AZZAR_SKILL_AUTH_SUCCESS' &&
          event.data?.provider === provider.id
        ) {
          cleanup();
          await checkStatus(provider.id);
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }, [provider.id, cleanup, checkStatus]);

    const handleConnect = async () => {
      if (!canCreate || !canEdit) return;
      if (server?.isConnected) return;

      setIsConnecting(true);
      try {
        // Skip redirectUri on desktop (app:// protocol) since the system browser can't navigate to it
        const redirectUri = window.location.protocol.startsWith('http')
          ? `${window.location.origin}/oauth/callback/success?provider=${encodeURIComponent(provider.id)}`
          : undefined;
        const { authorizeUrl } = await getAuthorizeUrl(provider.id, { redirectUri });
        openOAuthWindow(authorizeUrl);
      } catch (error) {
        console.error('[AzzarSkill] Failed to get authorize URL:', error);
      } finally {
        setIsConnecting(false);
      }
    };

    const handleDisconnect = () => {
      if (!canEdit) return;
      confirmModal({
        cancelText: t('cancel', { ns: 'common' }),
        content: t('tools.azzarSkill.disconnectConfirm.desc', { name: provider.label }),
        okButtonProps: { danger: true },
        okText: t('tools.azzarSkill.disconnect'),
        onOk: async () => {
          if (server) {
            await revokeConnect(server.identifier);
          } else if (isSelected) {
            onDelete?.();
          }
        },
        title: t('tools.azzarSkill.disconnectConfirm.title', { name: provider.label }),
      });
    };

    const renderIcon = () => {
      const { icon, label } = provider;
      if (typeof icon === 'string') {
        return <Avatar alt={label} avatar={icon} size={16} />;
      }
      return <Icon fill={cssVar.colorText} icon={icon} size={16} />;
    };

    const renderStatus = () => {
      if (!server) {
        return (
          <span className={styles.disconnected}>
            {t('tools.azzarSkill.disconnected', { defaultValue: 'Disconnected' })}
          </span>
        );
      }

      switch (server.status) {
        case AzzarSkillStatus.CONNECTED: {
          return (
            <span className={styles.connected}>
              {t('tools.azzarSkill.connected', { defaultValue: 'Connected' })}
            </span>
          );
        }
        case AzzarSkillStatus.ERROR: {
          return <span className={styles.error}>{t('tools.azzarSkill.error')}</span>;
        }
        default: {
          return (
            <span className={styles.disconnected}>
              {t('tools.azzarSkill.disconnected', { defaultValue: 'Disconnected' })}
            </span>
          );
        }
      }
    };

    const renderAction = () => {
      if (isConnecting || isWaitingAuth) {
        return (
          <Button disabled loading type="default">
            {t('tools.azzarSkill.connect')}
          </Button>
        );
      }

      if (!server || server.status !== AzzarSkillStatus.CONNECTED) {
        return (
          <Tooltip title={!canCreate ? createReason : editReason}>
            <Button
              disabled={!canCreate || !canEdit}
              icon={<Icon icon={SquareArrowOutUpRight} />}
              type="default"
              onClick={handleConnect}
            >
              {t('tools.azzarSkill.connect')}
            </Button>
          </Tooltip>
        );
      }

      return (
        <DropdownMenu
          placement="bottomRight"
          items={[
            {
              disabled: !canEdit,
              icon: <Icon icon={Unplug} />,
              key: 'disconnect',
              label: t('tools.azzarSkill.disconnect', { defaultValue: 'Disconnect' }),
              onClick: handleDisconnect,
            },
          ]}
        >
          <Tooltip title={editReason}>
            <AzzarButton disabled={!canEdit} icon={MoreHorizontalIcon} />
          </Tooltip>
        </DropdownMenu>
      );
    };

    const isConnected = server?.status === AzzarSkillStatus.CONNECTED;

    // Compact connect/status control for the left-list (NavItem) row. Mirrors the
    // ChatInput skills dropdown UX: connected → green check; otherwise a Connect
    // button that opens the OAuth flow inline, so users can tell what is connected
    // and aren't left staring at a blank detail panel wondering if it's a bug.
    const renderNavExtra = () => {
      if (isConnecting || isWaitingAuth) {
        return <Button disabled loading size="small" type="text" />;
      }
      if (isConnected) {
        return (
          <Tooltip title={t('tools.azzarSkill.connected', { defaultValue: 'Connected' })}>
            <Center width={20}>
              <Icon icon={CircleCheck} size={16} style={{ color: cssVar.colorSuccess }} />
            </Center>
          </Tooltip>
        );
      }
      return (
        <Tooltip title={!canCreate ? createReason : editReason}>
          <Button
            disabled={!canCreate || !canEdit}
            icon={<Icon icon={SquareArrowOutUpRight} />}
            size="small"
            type="text"
            onClick={handleConnect}
          >
            {t('tools.azzarSkill.connect')}
          </Button>
        </Tooltip>
      );
    };

    if (onSelect) {
      const renderNavIcon = () => {
        const { icon, label } = provider;
        if (typeof icon === 'string') return <Avatar alt={label} avatar={icon} size={18} />;
        return <Icon fill={cssVar.colorText} icon={icon} size={18} />;
      };
      return (
        <NavItem
          active={isSelected}
          extra={renderNavExtra()}
          icon={renderNavIcon}
          title={provider.label}
          titleColor={!isConnected ? cssVar.colorTextDescription : undefined}
          // Only connected connectors open the detail panel. When disconnected,
          // the row is inert and the only affordance is the inline Connect button —
          // otherwise clicking opens a blank detail panel that reads as a bug.
          onClick={isConnected ? onSelect : undefined}
        />
      );
    }

    return (
      <Flexbox
        horizontal
        align="center"
        className={styles.container}
        gap={8}
        justify="space-between"
        style={{
          ...(isSelected ? { background: 'var(--azzar-color-primary-bg)', borderRadius: 6 } : {}),
          ...(onSelect ? { cursor: 'pointer' } : {}),
        }}
        onClick={onSelect}
      >
        <Flexbox horizontal align="center" gap={8} style={{ flex: 1, overflow: 'hidden' }}>
          <Flexbox
            horizontal
            align="center"
            gap={8}
            style={{ cursor: onSelect ? undefined : 'pointer' }}
            onClick={
              onSelect
                ? undefined
                : () => createAzzarSkillDetailModal({ identifier: provider.id })
            }
          >
            <div className={`${styles.icon} ${!isConnected ? styles.disconnectedIcon : ''}`}>
              {renderIcon()}
            </div>
            <span className={`${styles.title} ${!isConnected ? styles.disconnectedTitle : ''}`}>
              {provider.label}
            </span>
          </Flexbox>
          {!isConnected && renderStatus()}
        </Flexbox>
        {!onSelect && (
          <Flexbox horizontal align="center" gap={8}>
            {isConnected && renderStatus()}
            {renderAction()}
          </Flexbox>
        )}
      </Flexbox>
    );
  },
);

AzzarSkillItem.displayName = 'AzzarSkillItem';

export default AzzarSkillItem;
