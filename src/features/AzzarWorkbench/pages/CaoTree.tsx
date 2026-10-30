import { Flexbox, Icon, Tag } from '@azzar/ui';
import {
  Bot,
  Building2,
  ChevronDown,
  ChevronRight,
  Cpu,
  Crown,
  Folder,
  Lock,
  Network,
  RefreshCw,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { type FC, useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';

import { missionService } from '@/services/mission';

import { buildCaoTree, type CaoNode, type CaoNodeType, type CaoRisk, countNodes } from '../domain/cao';
import { useWorkbench } from '../hooks/useWorkbench';
import { type AzzarKey, useAzzarT } from '../ui/i18n';
import { Btn, Card, formatUsd, Header, Page, styles } from '../ui/kit';

const RISK_KEY: Record<CaoRisk, AzzarKey> = {
  blocked: 'riskBlocked',
  needs_decision: 'riskNeeds',
  none: 'riskNone',
  running: 'riskRunning',
};

const RISK_COLOR: Record<CaoRisk, 'default' | 'blue' | 'gold' | 'red' | 'green'> = {
  blocked: 'red',
  needs_decision: 'gold',
  none: 'green',
  running: 'blue',
};

const NODE_ICON: Record<CaoNodeType, any> = {
  agent: Bot,
  approval_gate: ShieldCheck,
  cao: Network,
  dag_node: Cpu,
  department: Building2,
  group: Folder,
  mission: Target,
  project: Folder,
  root: Crown,
};

const TreeBranchNode: FC<{
  collapsed: Set<string>;
  depth: number;
  isLast: boolean;
  node: CaoNode;
  toggle: (id: string) => void;
}> = ({ collapsed, depth, isLast, node, toggle }) => {
  const { bi, t } = useAzzarT();
  const closed = collapsed.has(node.id);
  const hasChildren = node.children.length > 0;
  const missionId = node.type === 'mission' ? node.id.replace(/^mission:/, '') : null;
  const NodeIcon = NODE_ICON[node.type] || Network;

  return (
    <div
      style={{
        marginInlineStart: depth === 0 ? 0 : 28,
        paddingBlockStart: depth === 0 ? 0 : 10,
        position: 'relative',
      }}
    >
      {/* Visual tree connector lines */}
      {depth > 0 && (
        <>
          <div
            style={{
              background: 'var(--ant-color-border-secondary, #2b303b)',
              height: isLast ? 26 : '100%',
              insetInlineStart: -16,
              position: 'absolute',
              top: 0,
              width: 2,
            }}
          />
          <div
            style={{
              background: 'var(--ant-color-border-secondary, #2b303b)',
              height: 2,
              insetInlineStart: -16,
              position: 'absolute',
              top: 26,
              width: 16,
            }}
          />
        </>
      )}

      {/* Node Card in @azzar/ui design system */}
      <div
        style={{
          alignItems: 'center',
          background:
            node.type === 'cao' || node.type === 'root'
              ? 'var(--ant-color-fill-Tertiary, var(--ant-color-bg-container))'
              : 'var(--ant-color-bg-container)',
          border:
            node.risk === 'needs_decision'
              ? '1px solid var(--ant-color-warning)'
              : node.risk === 'blocked'
                ? '1px solid var(--ant-color-error)'
                : '1px solid var(--ant-color-border-secondary, #23262d)',
          borderRadius: 10,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          justifyContent: 'space-between',
          padding: '10px 14px',
        }}
      >
        <Flexbox horizontal align="center" gap={10} wrap="wrap">
          {hasChildren ? (
            <button
              aria-label={closed ? 'Expand' : 'Collapse'}
              type="button"
              style={{
                alignItems: 'center',
                background: 'var(--ant-color-fill-secondary)',
                border: 'none',
                borderRadius: 6,
                color: 'var(--ant-color-text)',
                cursor: 'pointer',
                display: 'inline-flex',
                height: 24,
                justifyContent: 'center',
                width: 24,
              }}
              onClick={() => toggle(node.id)}
            >
              <Icon icon={closed ? ChevronRight : ChevronDown} size={14} />
            </button>
          ) : (
            <span style={{ display: 'inline-block', width: 24 }} />
          )}

          <div
            style={{
              alignItems: 'center',
              background: 'var(--ant-color-fill-secondary)',
              borderRadius: 8,
              color: 'var(--ant-color-primary)',
              display: 'inline-flex',
              height: 30,
              justifyContent: 'center',
              width: 30,
            }}
          >
            <Icon icon={NodeIcon} size={16} />
          </div>

          <Flexbox gap={2}>
            {missionId ? (
              <Link
                to={`/azzar/missions/${missionId}`}
                style={{
                  color: 'var(--ant-color-primary)',
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                {bi(node.label)}
              </Link>
            ) : (
              <strong style={{ fontSize: 13 }}>{bi(node.label)}</strong>
            )}
            {node.meta && (
              <span style={{ ...styles.muted, fontSize: 11 }}>
                <code>{node.meta}</code>
              </span>
            )}
          </Flexbox>
        </Flexbox>

        <Flexbox horizontal align="center" gap={8} wrap="wrap">
          <Tag size="small">{node.type}</Tag>
          <Tag color={RISK_COLOR[node.risk]} size="small">
            {t(RISK_KEY[node.risk])}
          </Tag>
          {node.tokens > 0 && (
            <Tag color="blue" size="small">
              {node.tokens.toLocaleString()} tokens
            </Tag>
          )}
          <Tag size="small">{formatUsd(node.costUsd)}</Tag>
        </Flexbox>
      </div>

      {/* Child Branch Nodes */}
      {!closed && hasChildren && (
        <div style={{ position: 'relative' }}>
          {node.children.map((c, idx) => (
            <TreeBranchNode
              collapsed={collapsed}
              depth={depth + 1}
              isLast={idx === node.children.length - 1}
              key={c.id}
              node={c}
              toggle={toggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const collectIds = (n: CaoNode): string[] => [n.id, ...n.children.flatMap(collectIds)];

const CaoTree: FC = () => {
  const { t } = useAzzarT();
  const [searchParams] = useSearchParams();
  const data = useWorkbench((s) => s);
  const isAdminStore = useWorkbench((s) => Boolean(s.isAdmin));
  const setAdminMode = useWorkbench((s) => s.setAdminMode);
  const syncMissions = useWorkbench((s) => s.syncMissions);
  const [loading, setLoading] = useState(false);

  const isAdmin = isAdminStore || searchParams.get('admin') === '1';

  const loadLiveState = useCallback(async () => {
    if (process.env.NODE_ENV === 'test' || !isAdmin) return;
    setLoading(true);
    try {
      const items = await missionService.list(30);
      syncMissions(items.map((i) => i.workbenchMission as any));
    } catch {
      // Keep current store state if offline
    } finally {
      setLoading(false);
    }
  }, [isAdmin, syncMissions]);

  useEffect(() => {
    void loadLiveState();
  }, [loadLiveState]);

  const tree = buildCaoTree(data, 'company');
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const toggle = (id: string) =>
    setCollapsed((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (!isAdmin) {
    return (
      <Page>
        <Header
          subtitle="Restricted to system administrators and organization owners."
          title={t('caoTitle')}
        />
        <Card>
          <Flexbox gap={12}>
            <Flexbox horizontal align="center" gap={8}>
              <Icon icon={Lock} style={{ color: 'var(--ant-color-warning)' }} />
              <strong>Admin-Only Surface (403 Restricted)</strong>
            </Flexbox>
            <p style={styles.muted}>
              The Chief Agent Orchestrator (CAO) hierarchy tree is an administrative inspection
              surface and is not shown to standard users in the main navigation.
            </p>
            <div>
              <Btn primary onClick={() => setAdminMode(true)}>
                Enable Admin Inspector Mode
              </Btn>
            </div>
          </Flexbox>
        </Card>
      </Page>
    );
  }

  return (
    <Page>
      <Header
        subtitle={`${t('caoSubtitle')} (${countNodes(tree)} nodes · ${tree.tokens.toLocaleString()} tokens · ${formatUsd(tree.costUsd)})`}
        title={t('caoTitle')}
        actions={
          <Flexbox horizontal align="center" gap={8} wrap="wrap">
            <Tag color="blue" size="small">
              Admin Inspector · PostgreSQL Live
            </Tag>
            <Btn disabled={loading} onClick={() => void loadLiveState()}>
              <Icon icon={RefreshCw} size="small" />
              <span>{loading ? '...' : 'Sync DB'}</span>
            </Btn>
            <Btn onClick={() => setCollapsed(new Set())}>{t('expandAll')}</Btn>
            <Btn
              onClick={() => setCollapsed(new Set(collectIds(tree).filter((i) => i !== tree.id)))}
            >
              {t('collapseAll')}
            </Btn>
            {isAdminStore && (
              <Btn onClick={() => setAdminMode(false)}>Exit Admin Mode</Btn>
            )}
          </Flexbox>
        }
      />

      {/* Summary Rollup Strip */}
      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        }}
      >
        <Card style={{ gap: 4, padding: '12px 16px' }}>
          <span style={{ ...styles.muted, fontSize: 12 }}>Total Tree Nodes</span>
          <strong style={{ fontSize: 18 }}>{countNodes(tree)}</strong>
        </Card>
        <Card style={{ gap: 4, padding: '12px 16px' }}>
          <span style={{ ...styles.muted, fontSize: 12 }}>PostgreSQL Missions</span>
          <strong style={{ fontSize: 18 }}>{data.missions.length}</strong>
        </Card>
        <Card style={{ gap: 4, padding: '12px 16px' }}>
          <span style={{ ...styles.muted, fontSize: 12 }}>Total Tokens Rolled Up</span>
          <strong style={{ fontSize: 18 }}>{tree.tokens.toLocaleString()}</strong>
        </Card>
        <Card style={{ gap: 4, padding: '12px 16px' }}>
          <span style={{ ...styles.muted, fontSize: 12 }}>Total Cost Rolled Up</span>
          <strong style={{ fontSize: 18 }}>{formatUsd(tree.costUsd)}</strong>
        </Card>
      </div>

      {/* Hierarchical Tree Diagram */}
      <Card style={{ padding: 24 }}>
        <TreeBranchNode
          collapsed={collapsed}
          depth={0}
          isLast={true}
          node={tree}
          toggle={toggle}
        />
      </Card>
    </Page>
  );
};

export default CaoTree;
