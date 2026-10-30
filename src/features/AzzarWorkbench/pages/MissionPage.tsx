import { Flexbox, Icon } from '@azzar/ui';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  FileCheck2,
  Play,
  RefreshCw,
  ShieldCheck,
  StopCircle,
} from 'lucide-react';
import { type FC, useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';

import { missionService } from '@/services/mission';

import { getAgentTemplate } from '../catalog';
import { useWorkbench } from '../hooks/useWorkbench';
import { useAzzarT } from '../ui/i18n';
import {
  BiList,
  Btn,
  Card,
  Empty,
  formatUsd,
  Header,
  Marker,
  Notice,
  Page,
  styles,
} from '../ui/kit';
import { statusKey } from '../ui/MissionRow';

const NodeReportCard: FC<{ nodeId: string; output: any }> = ({ nodeId, output }) => {
  if (!output) return null;

  if (nodeId === 'N1' && Array.isArray(output.findings)) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
        {output.specialistSummaryAr && (
          <p style={{ ...styles.muted, color: 'var(--ant-color-text)' }}>
            {output.specialistSummaryAr}
          </p>
        )}
        {output.findings.map((f: any, idx: number) => (
          <div
            key={idx}
            style={{
              background: 'var(--ant-color-fill-quaternary)',
              borderRadius: 6,
              fontSize: 12,
              padding: '8px 10px',
            }}
          >
            <div>{f.claim}</div>
            <div style={{ ...styles.muted, fontSize: 11, marginTop: 4 }}>
              Source: <code>{f.sourceUrl}</code> · Checked: {f.dateChecked}
              {f.httpStatus ? ` · HTTP ${f.httpStatus}` : ''}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (nodeId === 'N2' && Array.isArray(output.brandFacts)) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
        {output.positioningAr && (
          <p style={{ ...styles.muted, color: 'var(--ant-color-text)' }}>{output.positioningAr}</p>
        )}
        <div style={{ fontSize: 12 }}>
          <strong>Brand Facts ({output.brandFacts.length}):</strong>
          <ul style={{ margin: '4px 0', paddingInlineStart: 18 }}>
            {output.brandFacts.map((b: any, i: number) => (
              <li key={i} style={styles.muted}>
                {b.fact} (<code>{b.sourceFile}</code>)
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (nodeId === 'N3') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
        <div style={{ fontSize: 12 }}>
          <strong>Audience:</strong> <span style={styles.muted}>{output.audience}</span>
        </div>
        <div style={{ fontSize: 12 }}>
          <strong>Message (Egyptian Arabic):</strong>{' '}
          <span style={{ color: 'var(--ant-color-text)' }}>{output.messageAr}</span>
        </div>
        {Array.isArray(output.ideas) && (
          <div style={{ fontSize: 12 }}>
            <strong>Campaign Ideas ({output.ideas.length}):</strong>
            <ul style={{ margin: '4px 0', paddingInlineStart: 18 }}>
              {output.ideas.map((idea: any, i: number) => (
                <li key={i} style={styles.muted}>
                  <strong>{idea.title}:</strong> {idea.descriptionAr} (<code>{idea.sourceRef}</code>
                  )
                </li>
              ))}
            </ul>
          </div>
        )}
        {output.englishSummary && (
          <div style={{ fontSize: 12 }}>
            <strong>English Summary:</strong>{' '}
            <span style={styles.muted}>{output.englishSummary}</span>
          </div>
        )}
      </div>
    );
  }

  if (nodeId === 'N4' && Array.isArray(output.rows)) {
    return (
      <div style={{ marginTop: 8, overflowX: 'auto' }}>
        <div style={{ ...styles.muted, fontSize: 11, marginBottom: 4 }}>{output.disclaimer}</div>
        <table style={{ borderCollapse: 'collapse', fontSize: 12, width: '100%' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--ant-color-border-secondary)' }}>
              <th style={{ padding: '4px 8px', textAlign: 'start' }}>ID</th>
              <th style={{ padding: '4px 8px', textAlign: 'start' }}>Category</th>
              <th style={{ padding: '4px 8px', textAlign: 'start' }}>City</th>
              <th style={{ padding: '4px 8px', textAlign: 'start' }}>Channel</th>
              <th style={{ padding: '4px 8px', textAlign: 'start' }}>Label</th>
            </tr>
          </thead>
          <tbody>
            {output.rows.map((r: any) => (
              <tr
                key={r.id}
                style={{ borderBottom: '1px solid var(--ant-color-border-secondary)' }}
              >
                <td style={{ padding: '4px 8px' }}>
                  <code>{r.id}</code>
                </td>
                <td style={{ padding: '4px 8px' }}>{r.businessCategory || r.businessType}</td>
                <td style={{ padding: '4px 8px' }}>{r.city}</td>
                <td style={{ padding: '4px 8px' }}>{r.preferredChannel || r.channel}</td>
                <td style={{ padding: '4px 8px' }}>
                  <code>
                    {r.label} (sample={String(r.sample)})
                  </code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (nodeId === 'N5' && output.checks) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
        {output.managerReviewAr && (
          <p style={{ ...styles.muted, color: 'var(--ant-color-text)' }}>
            {output.managerReviewAr}
          </p>
        )}
        <div
          style={{
            display: 'grid',
            gap: 6,
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          }}
        >
          {Object.entries(output.checks).map(([k, v]: [string, any]) => (
            <div
              key={k}
              style={{
                background: 'var(--ant-color-fill-quaternary)',
                borderRadius: 6,
                fontSize: 11,
                padding: '6px 8px',
              }}
            >
              <strong>
                {v.pass ? 'PASS' : 'FAIL'} · {k}
              </strong>
              <div style={styles.muted}>{v.reason}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (nodeId === 'N7' && output.artifactPath) {
    return (
      <div
        style={{
          background: 'var(--ant-color-fill-quaternary)',
          borderRadius: 6,
          fontSize: 12,
          marginTop: 8,
          padding: '8px 10px',
        }}
      >
        <div>
          <strong>Brief Artifact Path:</strong> <code>{output.artifactPath}</code> (
          {output.bytesWritten} bytes)
        </div>
        <div>
          <strong>SHA-256 Hash:</strong> <code>{output.artifactHash}</code>
        </div>
      </div>
    );
  }

  return null;
};

const MissionPage: FC = () => {
  const { id } = useParams();
  const { bi, t } = useAzzarT();
  const storeMission = useWorkbench((s) => s.missions.find((m) => m.id === id));
  const missions = useWorkbench((s) => s.missions);
  const syncMissions = useWorkbench((s) => s.syncMissions);

  const [detail, setDetail] = useState<Awaited<ReturnType<typeof missionService.getById>> | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!id || process.env.NODE_ENV === 'test') return;
    setBusy(true);
    try {
      const d = await missionService.getById(id);
      setDetail(d);
      const others = missions.filter((m) => m.id !== id);
      syncMissions([d.workbenchMission as any, ...others]);
    } catch (err: any) {
      setActionError(err?.message || null);
    } finally {
      setBusy(false);
    }
  }, [id, missions, syncMissions]);

  useEffect(() => {
    void fetchDetail();
  }, [id]);

  const mission = (detail?.workbenchMission as any) ?? storeMission;
  const engineState = detail?.engineState;

  if (!mission) {
    return (
      <Page>
        <Empty>{busy ? t('generatingStep') : t('notFound')}</Empty>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Link to="/azzar/missions">
            <Btn>{t('back')}</Btn>
          </Link>
        </div>
      </Page>
    );
  }

  const running = mission.status === 'running';
  const pending = mission.approvals.filter((a: any) => a.status === 'pending');
  const agentName = (agentId: string) => {
    const a = getAgentTemplate(agentId);
    return a ? bi(a.name) : agentId;
  };

  const handleDecision = async (approvalId: string, decision: 'approved' | 'rejected') => {
    if (!id) return;
    setBusy(true);
    setActionError(null);
    try {
      const res = await missionService.decideApproval({
        approvalId,
        decidedBy: 'Eng. Hazem Elerefy',
        decision,
        missionId: id,
      });
      if (res.detail) {
        setDetail(res.detail);
        const others = missions.filter((m) => m.id !== id);
        syncMissions([res.detail.workbenchMission as any, ...others]);
      }
    } catch (err: any) {
      setActionError(err?.message || t('errGeneric'));
    } finally {
      setBusy(false);
    }
  };

  const handleResume = async () => {
    if (!id) return;
    setBusy(true);
    setActionError(null);
    try {
      const res = await missionService.resume(id);
      if (res.detail) {
        setDetail(res.detail);
        const others = missions.filter((m) => m.id !== id);
        syncMissions([res.detail.workbenchMission as any, ...others]);
      }
    } catch (err: any) {
      setActionError(err?.message || t('errGeneric'));
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    setBusy(true);
    setActionError(null);
    try {
      const d = await missionService.cancel(id);
      if (d) {
        setDetail(d);
        const others = missions.filter((m) => m.id !== id);
        syncMissions([d.workbenchMission as any, ...others]);
      }
    } catch (err: any) {
      setActionError(err?.message || t('errGeneric'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page>
      <Header
        subtitle={`ID: ${mission.id} · ${t('missionDeadline')}: ${mission.deadline} · ${t('cost')}: ${formatUsd(mission.costUsd)} · Tokens: ${engineState?.tokenRollup?.totalTokens ?? 0}`}
        title={mission.goal}
        actions={
          <Flexbox horizontal align="center" gap={6}>
            <Marker label={statusKey(mission.status)} />
            <Marker label="live" />
            <Btn disabled={busy} onClick={() => void fetchDetail()}>
              <Icon icon={RefreshCw} size="small" />
            </Btn>
          </Flexbox>
        }
      />
      <Notice>{t('liveNote')}</Notice>
      {actionError && <Notice>{actionError}</Notice>}
      {busy && (
        <Notice>
          {t('generatingStep')} ({mission.modelId || 'gemma4:e4b'})
        </Notice>
      )}

      {/* Pending Approvals (N6 Gate) */}
      {pending.map((a: any) => {
        const dbApproval = engineState?.approvals.find((x) => x.id === a.id);
        return (
          <Card key={a.id} style={{ borderColor: 'var(--ant-color-primary)', borderWidth: 2 }}>
            <Flexbox gap={12}>
              <Flexbox horizontal align="center" justify="space-between" wrap="wrap">
                <Flexbox horizontal align="center" gap={8}>
                  <Icon icon={AlertTriangle} style={{ color: 'var(--ant-color-primary)' }} />
                  <h2 style={{ ...styles.h2, margin: 0 }}>{t('approvalCard')}</h2>
                </Flexbox>
                {dbApproval && (
                  <code style={{ fontSize: 11 }}>SHA-256: {dbApproval.shownPayloadHash}</code>
                )}
              </Flexbox>
              <strong style={{ fontSize: 15 }}>{bi(a.label)}</strong>
              <p style={styles.muted}>{bi(a.summary)}</p>
              <p style={{ ...styles.muted, fontSize: 12 }}>{t('approvalNote')}</p>
              <Flexbox horizontal align="center" gap={10}>
                <Btn primary disabled={busy} onClick={() => void handleDecision(a.id, 'approved')}>
                  <Icon icon={CheckCircle2} size="small" />
                  <span>{t('approve')}</span>
                </Btn>
                <Btn disabled={busy} onClick={() => void handleDecision(a.id, 'rejected')}>
                  {t('reject')}
                </Btn>
              </Flexbox>
            </Flexbox>
          </Card>
        );
      })}

      {/* Mission Controls */}
      <Flexbox horizontal align="center" gap={10} wrap="wrap">
        <Btn primary disabled={!running || busy} onClick={() => void handleResume()}>
          <Icon icon={Play} size="small" />
          <span>{t('runAll')}</span>
        </Btn>
        <Btn
          disabled={mission.status === 'completed' || mission.status === 'cancelled' || busy}
          onClick={() => void handleCancel()}
        >
          <Icon icon={StopCircle} size="small" />
          <span>{t('cancel')}</span>
        </Btn>
      </Flexbox>

      {/* Active Specialists */}
      <Flexbox gap={8}>
        <h2 style={styles.h2}>{t('specialistsNow')}</h2>
        {mission.activeSpecialists.length === 0 ? (
          <p style={styles.muted}>{t('noneActive')}</p>
        ) : (
          <Flexbox horizontal align="center" gap={8} wrap="wrap">
            {mission.activeSpecialists.map((s: string) => (
              <Marker raw key={s} label={agentName(s)} />
            ))}
          </Flexbox>
        )}
      </Flexbox>

      {/* Node Lanes with Report Cards (N1-N7) */}
      <Flexbox gap={10}>
        <h2 style={styles.h2}>{t('goalGraph')} (N1–N7 DAG Lanes)</h2>
        <Flexbox gap={10}>
          {mission.nodes.map((n: any) => {
            const dbNode = engineState?.nodes.find((dn) => dn.nodeId === n.id);
            const nodeOutput = engineState?.nodeOutputs?.[n.id];
            return (
              <Card
                key={n.id}
                style={{
                  marginInlineStart: n.parentId ? 24 : 0,
                  padding: '14px 18px',
                }}
              >
                <Flexbox gap={6}>
                  <Flexbox horizontal align="center" justify="space-between" wrap="wrap">
                    <strong style={{ fontSize: 14 }}>{bi(n.title)}</strong>
                    <Flexbox horizontal align="center" gap={6}>
                      {Boolean(dbNode?.dependsOnJson) &&
                        Array.isArray(dbNode?.dependsOnJson) &&
                        (dbNode.dependsOnJson as string[]).length > 0 && (
                          <code style={{ fontSize: 11 }}>
                            dependsOn: [{(dbNode.dependsOnJson as string[]).join(', ')}]
                          </code>
                        )}
                      <Marker raw label={`${n.kind} · ${dbNode?.status || n.status}`} />
                    </Flexbox>
                  </Flexbox>
                  <span style={{ ...styles.muted, fontSize: 12 }}>
                    {dbNode?.assignee || agentName(n.agentId)}
                  </span>
                  {n.output && <p style={{ ...styles.muted, marginTop: 4 }}>{bi(n.output)}</p>}
                  <NodeReportCard nodeId={n.id} output={nodeOutput} />
                </Flexbox>
              </Card>
            );
          })}
        </Flexbox>
      </Flexbox>

      {/* PostgreSQL Checkpoint & Consumed Approval State */}
      {engineState?.checkpoint && (
        <Card>
          <Flexbox gap={8}>
            <Flexbox horizontal align="center" gap={8}>
              <Icon icon={Database} size="small" style={{ color: 'var(--ant-color-primary)' }} />
              <h2 style={{ ...styles.h2, margin: 0 }}>
                PostgreSQL Checkpoint ({engineState.checkpoint.id})
              </h2>
            </Flexbox>
            <div style={{ ...styles.muted, fontSize: 12 }}>
              Created: <code>{engineState.checkpoint.createdAt}</code> · Tokens:{' '}
              <code>{engineState.tokenRollup.totalTokens}</code> (prompt:{' '}
              {engineState.tokenRollup.promptTokens}, completion:{' '}
              {engineState.tokenRollup.completionTokens})
            </div>
            {engineState.approvals.length > 0 && (
              <div style={{ ...styles.muted, fontSize: 12 }}>
                {engineState.approvals.map((appr) => (
                  <div key={appr.id}>
                    Approval <code>{appr.id}</code> ({appr.nodeId}): decision=
                    <code>{appr.decision || 'pending'}</code> · decidedBy=
                    <code>{appr.decidedBy || 'N/A'}</code> · consumedAt=
                    <code>{appr.consumedAt || 'unconsumed'}</code> · hash=
                    <code>{appr.shownPayloadHash}</code>
                  </div>
                ))}
              </div>
            )}
          </Flexbox>
        </Card>
      )}

      {/* Completion Report & Verification Receipt */}
      {mission.report && (
        <Card style={{ borderColor: 'var(--ant-color-primary)' }}>
          <Flexbox gap={12}>
            <Flexbox horizontal align="center" gap={8}>
              <Icon icon={CheckCircle2} style={{ color: 'var(--ant-color-primary)' }} />
              <h2 style={{ ...styles.h2, margin: 0 }}>{t('reportTitle')}</h2>
            </Flexbox>
            <strong>{t('reportOutcome')}</strong>
            <p style={styles.muted}>{bi(mission.report.outcome)}</p>
            <strong>{t('reportDone')}</strong>
            <BiList items={mission.report.done} />
            <strong>{t('reportEvidence')}</strong>
            <BiList items={mission.report.evidence} />
            <strong>{t('reportNext')}</strong>
            <p style={styles.muted}>{bi(mission.report.next)}</p>
          </Flexbox>
        </Card>
      )}

      {/* PostgreSQL Receipt JSON */}
      {engineState?.receipt && (
        <Card>
          <Flexbox gap={8}>
            <Flexbox horizontal align="center" gap={8}>
              <Icon icon={FileCheck2} size="small" style={{ color: 'var(--ant-color-primary)' }} />
              <h2 style={{ ...styles.h2, margin: 0 }}>
                PostgreSQL Verification Receipt (mission_receipts)
              </h2>
            </Flexbox>
            <div style={{ ...styles.muted, fontSize: 12 }}>
              Model Disclosure:{' '}
              <code>
                {engineState.receipt.modelDisclosure.provider}/
                {engineState.receipt.modelDisclosure.model}
              </code>{' '}
              · Cost:{' '}
              <code>
                ${engineState.receipt.costRollup.totalCost} (
                {engineState.receipt.costRollup.costMethod || 'zero_cost'})
              </code>{' '}
              · Tool Calls: <code>{engineState.receipt.toolCalls.length}</code>
            </div>
            <details>
              <summary style={{ cursor: 'pointer', fontSize: 12 }}>
                Inspect Full Receipt JSON
              </summary>
              <pre
                dir="ltr"
                style={{
                  background: 'var(--ant-color-fill-quaternary)',
                  borderRadius: 6,
                  fontSize: 11,
                  maxHeight: 280,
                  overflow: 'auto',
                  padding: 10,
                }}
              >
                {JSON.stringify(engineState.receipt, null, 2)}
              </pre>
            </details>
          </Flexbox>
        </Card>
      )}

      {/* Reported Actions */}
      {mission.reported.length > 0 && (
        <Card>
          <Flexbox gap={8}>
            <Flexbox horizontal align="center" gap={8}>
              <Icon icon={ShieldCheck} size="small" style={{ color: 'var(--ant-color-primary)' }} />
              <h2 style={{ ...styles.h2, margin: 0 }}>{t('reportedActions')}</h2>
            </Flexbox>
            <BiList items={mission.reported.map((r: any) => r.text)} />
          </Flexbox>
        </Card>
      )}

      {/* Append-Only Journal Timeline */}
      <Flexbox gap={8}>
        <h2 style={styles.h2}>{t('timeline')} (mission_journal)</h2>
        <Card>
          <Flexbox gap={8}>
            {mission.events.map((e: any) => (
              <div key={e.id} style={{ ...styles.muted, fontSize: 12 }}>
                <code style={{ fontSize: 11 }}>{e.type}</code> · {agentName(e.agentId)} ·{' '}
                {bi(e.text)}
              </div>
            ))}
          </Flexbox>
        </Card>
      </Flexbox>
    </Page>
  );
};

export default MissionPage;
