'use client';

import { Flexbox, Tag } from '@azzar/ui';
import { Bot, Building2, Folder, Network, Newspaper, Store, Target } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useWorkbench } from '@/features/AzzarWorkbench/hooks/useWorkbench';
import NavItem from '@/features/NavPanel/components/NavItem';
import { type NavItemProps } from '@/features/NavPanel/components/NavItem';
import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';
import WorkspaceLink from '@/features/Workspace/WorkspaceLink';
import { useActiveLocation } from '@/hooks/useActiveLocation';
import { useActiveTabKey } from '@/hooks/useActiveTabKey';
import { useNavLayout } from '@/hooks/useNavLayout';
import { isModifierClick } from '@/utils/navigation';

/** Keys that are rendered in the header; all others are managed by Body via sidebarSectionOrder */
const HEADER_KEYS = new Set(['home', 'search']);

interface WorkbenchNavItemConfig {
  companyOnly?: boolean;
  icon: any;
  key: string;
  title: string;
  url: string;
}

const WORKBENCH_NAV_ITEMS: WorkbenchNavItemConfig[] = [
  { icon: Target, key: 'missions', title: 'Missions', url: '/azzar/missions' },
  { icon: Store, key: 'marketplace', title: 'Marketplace', url: '/azzar/marketplace' },
  { icon: Bot, key: 'agents', title: 'My Agents', url: '/azzar/agents' },
  {
    companyOnly: true,
    icon: Building2,
    key: 'departments',
    title: 'Departments',
    url: '/azzar/departments',
  },
  { icon: Folder, key: 'projects', title: 'Projects', url: '/azzar/projects' },
  { companyOnly: true, icon: Network, key: 'cao', title: 'CAO Tree', url: '/azzar/cao' },
  { icon: Newspaper, key: 'briefing', title: 'Briefing', url: '/azzar/briefing' },
];

const Nav = memo(() => {
  const tab = useActiveTabKey();
  const { pathname } = useActiveLocation();
  const navigate = useWorkspaceAwareNavigate();
  const { t } = useTranslation('common');
  const { topNavItems: items } = useNavLayout();
  const mode = useWorkbench((s) => s.mode);

  const newBadge = (
    <Tag color="blue" size="small">
      {t('new')}
    </Tag>
  );

  const visibleWorkbenchItems = useMemo(() => {
    return WORKBENCH_NAV_ITEMS.filter((item) => mode === 'company' || !item.companyOnly);
  }, [mode]);

  const isWbItemActive = (url: string) => {
    return pathname === url || pathname.startsWith(`${url}/`);
  };

  const isHomeActive = pathname === '/';

  return (
    <Flexbox gap={1} paddingInline={4}>
      {items
        .filter((item) => HEADER_KEYS.has(item.key) && !item.hidden)
        .map((item) => {
          const extra = item.isNew ? newBadge : undefined;
          const active = item.key === 'home' ? isHomeActive : tab === item.key;

          const navItem = (
            <NavItem
              active={active}
              extra={extra}
              hidden={item.hidden}
              icon={item.icon as NavItemProps['icon']}
              title={item.title}
              onClick={item.onClick}
            />
          );

          if (!item.url) return <div key={item.key}>{navItem}</div>;

          return (
            <WorkspaceLink
              key={item.key}
              to={item.url}
              onClick={(e) => {
                if (isModifierClick(e)) return;
                e.preventDefault();
                item?.onClick?.();
                if (item.url) {
                  navigate(item.url);
                }
              }}
            >
              {navItem}
            </WorkspaceLink>
          );
        })}

      {/* Workbench navigation items directly inside the global sidebar */}
      {visibleWorkbenchItems.map((item) => {
        const active = isWbItemActive(item.url);

        return (
          <WorkspaceLink
            key={item.key}
            to={item.url}
            onClick={(e) => {
              if (isModifierClick(e)) return;
              e.preventDefault();
              navigate(item.url);
            }}
          >
            <NavItem active={active} icon={item.icon} title={item.title} />
          </WorkspaceLink>
        );
      })}
    </Flexbox>
  );
});

export default Nav;
