import { type FC, useState } from 'react';
import { Link } from 'react-router';

import { buildCaoTree, type CaoNode, type CaoRisk, countNodes } from '../domain/cao';
import { useWorkbench } from '../hooks/useWorkbench';
import { type AzzarKey, useAzzarT } from '../ui/i18n';
import { Btn, formatUsd, Header, Marker, Page } from '../ui/kit';

const RISK_KEY: Record<CaoRisk, AzzarKey> = {
  blocked: 'riskBlocked',
  needs_decision: 'riskNeeds',
  none: 'riskNone',
  running: 'riskRunning',
};

const Node: FC<{
  collapsed: Set<string>;
  depth: number;
  node: CaoNode;
  toggle: (id: string) => void;
}> = ({ collapsed, depth, node, toggle }) => {
  const { bi } = useAzzarT();
  const closed = collapsed.has(node.id);
  const missionId = node.type === 'mission' ? node.id.replace(/^mission:/, '') : null;
  return (
    <div style={{ marginInlineStart: depth === 0 ? 0 : 20 }}>
      <div
        style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 8, paddingBlock: 4 }}
      >
        {node.children.length > 0 ? (
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: 18 }}
            type="button"
            onClick={() => toggle(node.id)}
          >
            {closed ? '+' : '−'}
          </button>
        ) : (
          <span style={{ width: 18 }} />
        )}
        {missionId ? (
          <Link to={`/azzar/missions/${missionId}`}>{bi(node.label)}</Link>
        ) : (
          <strong style={{ fontSize: 13 }}>{bi(node.label)}</strong>
        )}
        <Marker raw label={node.type} />
        {node.risk !== 'none' && <Marker label={RISK_KEY[node.risk]} />}
        {node.costUsd > 0 && (
          <span style={{ fontSize: 12, opacity: 0.7 }}>{formatUsd(node.costUsd)}</span>
        )}
      </div>
      {!closed &&
        node.children.map((c) => (
          <Node collapsed={collapsed} depth={depth + 1} key={c.id} node={c} toggle={toggle} />
        ))}
    </div>
  );
};

const collectIds = (n: CaoNode): string[] => [n.id, ...n.children.flatMap(collectIds)];

const CaoTree: FC = () => {
  const { t } = useAzzarT();
  const data = useWorkbench((s) => s);
  const tree = buildCaoTree(data, 'company');
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const toggle = (id: string) =>
    setCollapsed((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  return (
    <Page>
      <Header
        subtitle={`${t('caoSubtitle')} (${countNodes(tree)})`}
        title={t('caoTitle')}
        actions={
          <>
            <Marker label="simulated" />
            <Btn onClick={() => setCollapsed(new Set())}>{t('expandAll')}</Btn>
            <Btn
              onClick={() => setCollapsed(new Set(collectIds(tree).filter((i) => i !== tree.id)))}
            >
              {t('collapseAll')}
            </Btn>
          </>
        }
      />
      <Node collapsed={collapsed} depth={0} node={tree} toggle={toggle} />
    </Page>
  );
};

export default CaoTree;
