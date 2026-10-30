import { Flexbox, Icon } from '@azzar/ui';
import { Info } from 'lucide-react';
import { type CSSProperties, type FC, type ReactNode } from 'react';

import { useIsDark } from '@/hooks/useIsDark';

import { avatarUrl, type Bi, type DepartmentTemplate } from '../catalog';
import { type AzzarKey, useAzzarT } from './i18n';

const BORDER = '1px solid var(--ant-color-border-secondary, #23262d)';
const PRIMARY = 'var(--ant-color-primary)';

/**
 * Shared design tokens and styles matching the Azzar/LobeHub aesthetic.
 * Flat surfaces, subtle borders, high contrast typography, seamless dark/light adaptation.
 */
export const styles = {
  btn: {
    alignItems: 'center',
    background: 'var(--ant-color-fill-quaternary, rgba(255, 255, 255, 0.04))',
    border: BORDER,
    borderRadius: 8,
    color: 'var(--ant-color-text)',
    cursor: 'pointer',
    display: 'inline-flex',
    fontSize: 13,
    fontWeight: 500,
    gap: 6,
    justifyContent: 'center',
    lineHeight: '20px',
    paddingBlock: 7,
    paddingInline: 14,
    transition: 'all 0.15s ease-in-out',
  },
  btnPrimary: {
    background: PRIMARY,
    borderColor: PRIMARY,
    color: 'var(--ant-color-text-light-solid, #fff)',
    fontWeight: 600,
  },
  card: {
    backdropFilter: 'blur(12px)',
    background: 'var(--ant-color-bg-container)',
    border: BORDER,
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    padding: 20,
    transition: 'all 0.15s ease-in-out',
  },
  field: {
    background: 'var(--ant-color-fill-quaternary, var(--ant-color-bg-container))',
    border: BORDER,
    borderRadius: 8,
    boxSizing: 'border-box',
    color: 'var(--ant-color-text)',
    fontFamily: 'inherit',
    fontSize: 13,
    lineHeight: 1.5,
    outline: 'none',
    paddingBlock: 9,
    paddingInline: 12,
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    width: '100%',
  },
  select: {
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(150,150,150,0.6)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundPosition: 'calc(100% - 12px) center',
    backgroundRepeat: 'no-repeat',
    cursor: 'pointer',
    paddingInlineEnd: 36,
    WebkitAppearance: 'none',
  },
  grid: {
    display: 'grid',
    gap: 16,
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  },
  h1: {
    color: 'var(--ant-color-text)',
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  h2: {
    color: 'var(--ant-color-text)',
    fontSize: 16,
    fontWeight: 600,
    marginBlock: '8px 0',
    marginInline: 0,
  },
  marker: {
    alignItems: 'center',
    background: 'var(--ant-color-fill-secondary, rgba(255, 255, 255, 0.04))',
    border: BORDER,
    borderRadius: 999,
    color: 'var(--ant-color-text-secondary)',
    display: 'inline-flex',
    fontSize: 11,
    fontWeight: 500,
    gap: 4,
    lineHeight: '16px',
    paddingBlock: 2,
    paddingInline: 8,
    whiteSpace: 'nowrap',
  },
  muted: { color: 'var(--ant-color-text-secondary)', fontSize: 13, lineHeight: 1.6, margin: 0 },
  notice: {
    alignItems: 'center',
    background: 'var(--ant-color-fill-quaternary, rgba(255, 255, 255, 0.02))',
    border: BORDER,
    borderInlineStart: '3px solid var(--ant-color-primary)',
    borderRadius: 8,
    color: 'var(--ant-color-text-secondary)',
    display: 'flex',
    fontSize: 13,
    gap: 8,
    lineHeight: 1.5,
    paddingBlock: 10,
    paddingInline: 14,
  },
  row: { alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 8 },
  tab: {
    background: 'transparent',
    border: 'none',
    borderBlockEnd: '2px solid transparent',
    color: 'var(--ant-color-text-secondary)',
    cursor: 'pointer',
    fontSize: 13,
    paddingBlock: 8,
    paddingInline: 12,
  },
  tabActive: {
    borderBlockEnd: '2px solid var(--ant-color-primary)',
    color: 'var(--ant-color-text)',
    fontWeight: 600,
  },
} satisfies Record<string, CSSProperties>;

export const Page: FC<{ children: ReactNode; maxWidth?: number }> = ({
  children,
  maxWidth = 1120,
}) => {
  const { dir } = useAzzarT();
  return (
    <div dir={dir} style={{ height: '100%', overflowY: 'auto' }}>
      <Flexbox
        gap={20}
        style={{
          boxSizing: 'border-box',
          marginInline: 'auto',
          maxWidth,
          padding: '28px 24px 56px',
          width: '100%',
        }}
      >
        {children}
      </Flexbox>
    </div>
  );
};

export const Header: FC<{ actions?: ReactNode; subtitle?: string; title: string }> = ({
  actions,
  subtitle,
  title,
}) => (
  <Flexbox horizontal wrap align="flex-start" gap={12} justify="space-between">
    <Flexbox gap={4}>
      <h1 style={styles.h1}>{title}</h1>
      {subtitle && <p style={styles.muted}>{subtitle}</p>}
    </Flexbox>
    {actions && (
      <Flexbox horizontal wrap align="center" gap={8}>
        {actions}
      </Flexbox>
    )}
  </Flexbox>
);

/** A dictionary key, or raw text when `raw` is set. Typed so a wrong key fails the type-check. */
export const Marker: FC<{ label: AzzarKey; raw?: false } | { label: string; raw: true }> = (
  props,
) => {
  const { t } = useAzzarT();
  return <span style={styles.marker}>{props.raw ? props.label : t(props.label)}</span>;
};

/** The label that must stay on every screen that shows simulated work. */
export const SimulatedMarker: FC = () => <Marker label="simulated" />;

export const Notice: FC<{ children: ReactNode }> = ({ children }) => (
  <div style={styles.notice}>
    <Icon icon={Info} size="small" style={{ color: 'var(--ant-color-primary)', flex: 'none' }} />
    <div>{children}</div>
  </div>
);

export const Card: FC<{ children: ReactNode; style?: CSSProperties }> = ({ children, style }) => (
  <div style={{ ...styles.card, ...style }}>{children}</div>
);

export const Btn: FC<{
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  primary?: boolean;
  type?: 'button' | 'submit';
}> = ({ children, disabled, onClick, primary, type = 'button' }) => (
  <button
    disabled={disabled}
    type={type}
    style={{
      ...styles.btn,
      ...(primary ? styles.btnPrimary : {}),
      ...(disabled ? { cursor: 'not-allowed', opacity: 0.5 } : {}),
    }}
    onClick={onClick}
  >
    {children}
  </button>
);

export const Field: FC<{ children: ReactNode; hint?: string; label: string }> = ({
  children,
  hint,
  label,
}) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <span style={{ color: 'var(--ant-color-text)', fontSize: 13, fontWeight: 600 }}>{label}</span>
    {children}
    {hint && <span style={styles.muted}>{hint}</span>}
  </label>
);

export const Tabs: FC<{
  active: string;
  items: Array<{ key: string; label: string }>;
  onChange: (key: string) => void;
}> = ({ active, items, onChange }) => (
  <div
    style={{
      borderBlockEnd: '1px solid var(--ant-color-border-secondary, #23262d)',
      display: 'flex',
      flexWrap: 'wrap',
    }}
  >
    {items.map((i) => (
      <button
        key={i.key}
        style={{ ...styles.tab, ...(active === i.key ? styles.tabActive : {}) }}
        type="button"
        onClick={() => onChange(i.key)}
      >
        {i.label}
      </button>
    ))}
  </div>
);

export const Empty: FC<{ children: ReactNode }> = ({ children }) => (
  <div
    style={{
      ...styles.card,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '36px 20px',
      textAlign: 'center',
    }}
  >
    <p style={styles.muted}>{children}</p>
  </div>
);

export const BiList: FC<{ items: Bi[] }> = ({ items }) => {
  const { bi } = useAzzarT();
  return (
    <ul style={{ margin: 0, paddingInlineStart: 18 }}>
      {items.map((i, n) => (
        <li key={n} style={styles.muted}>
          {bi(i)}
        </li>
      ))}
    </ul>
  );
};

/** Approved avatar when the department has one, otherwise a neutral monogram tile (decision D1). */
export const DeptAvatar: FC<{ department: DepartmentTemplate; size?: number }> = ({
  department,
  size = 40,
}) => {
  const dark = useIsDark();
  const { bi } = useAzzarT();
  if (department.avatarKey) {
    return (
      <img
        alt=""
        height={size}
        src={avatarUrl(department.avatarKey, dark)}
        style={{ borderRadius: 8, flex: 'none' }}
        width={size}
      />
    );
  }
  const letter = [...bi(department.name)][0] ?? '?';
  return (
    <div
      aria-hidden
      style={{
        alignItems: 'center',
        border: '1px solid var(--ant-color-border-secondary, #23262d)',
        borderRadius: 8,
        display: 'flex',
        flex: 'none',
        fontSize: size * 0.45,
        fontWeight: 700,
        height: size,
        justifyContent: 'center',
        width: size,
      }}
    >
      {letter.toUpperCase()}
    </div>
  );
};

export const formatUsd = (n: number): string => `$${n.toFixed(2)}`;
