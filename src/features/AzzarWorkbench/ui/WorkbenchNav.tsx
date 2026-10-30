import { Flexbox, Icon } from '@azzar/ui';
import { Bot, Building2, Folder, Network, Newspaper, Store, Target } from 'lucide-react';
import { type CSSProperties, type FC } from 'react';
import { NavLink } from 'react-router';

import { useWorkbench } from '../hooks/useWorkbench';
import { type AzzarKey, useAzzarT } from './i18n';

interface Item {
  adminOnly?: boolean;
  companyOnly?: boolean;
  icon: any;
  label: AzzarKey;
  to: string;
}

const ITEMS: Item[] = [
  { icon: Target, label: 'navHome', to: '/' },
  { icon: Store, label: 'navMarketplace', to: '/azzar/marketplace' },
  { icon: Bot, label: 'navAgents', to: '/azzar/agents' },
  { companyOnly: true, icon: Building2, label: 'navDepartments', to: '/azzar/departments' },
  { icon: Folder, label: 'navProjects', to: '/azzar/projects' },
  { icon: Newspaper, label: 'navBriefing', to: '/azzar/briefing' },
  { adminOnly: true, companyOnly: true, icon: Network, label: 'navCao', to: '/azzar/cao' },
];

const navStyle: CSSProperties = {
  alignItems: 'center',
  borderBlockEnd: '1px solid var(--ant-color-border-secondary, #23262d)',
  display: 'flex',
  flexWrap: 'wrap',
  gap: 4,
  paddingBlockEnd: 8,
};

const linkBaseStyle: CSSProperties = {
  alignItems: 'center',
  borderRadius: 6,
  color: 'var(--ant-color-text-secondary)',
  display: 'inline-flex',
  fontSize: 13,
  fontWeight: 500,
  gap: 6,
  padding: '6px 12px',
  textDecoration: 'none',
  transition: 'all 0.15s ease-in-out',
  whiteSpace: 'nowrap',
};

const linkActiveStyle: CSSProperties = {
  backgroundColor: 'var(--ant-color-fill-secondary)',
  color: 'var(--ant-color-primary)',
  fontWeight: 600,
};

/**
 * The workbench's navigation bar styled to match the native Azzar/Lobe UI system.
 * Uses semantic theme tokens, Lucide icons, and layout primitives.
 * Company-only entries are hidden in Individual mode.
 */
export const WorkbenchNav: FC = () => {
  const { t } = useAzzarT();
  const mode = useWorkbench((s) => s.mode);
  const isAdmin = useWorkbench((s) => Boolean(s.isAdmin));
  if (!mode) return null;

  return (
    <nav aria-label="AZZAR" style={navStyle}>
      <Flexbox horizontal wrap align="center" gap={4}>
        {ITEMS.filter(
          (i) => (mode === 'company' || !i.companyOnly) && (!i.adminOnly || isAdmin),
        ).map((i) => (
          <NavLink
            end={i.to === '/'}
            key={i.to}
            to={i.to}
            style={({ isActive }) => ({
              ...linkBaseStyle,
              ...(isActive ? linkActiveStyle : {}),
            })}
          >
            <Icon icon={i.icon} size="small" />
            <span>{t(i.label)}</span>
          </NavLink>
        ))}
      </Flexbox>
    </nav>
  );
};
