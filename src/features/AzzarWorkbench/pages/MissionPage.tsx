import { Flexbox, Icon } from '@azzar/ui';
import { AlertTriangle, CheckCircle2, FastForward, Play, StopCircle } from 'lucide-react';
import { type FC } from 'react';
import { Link, useParams } from 'react-router';

import { getAgentTemplate } from '../catalog';
import { useWorkbench, workbenchStore } from '../hooks/useWorkbench';
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

const MissionPage: FC = () => {
  const { id } = useParams();
  const { bi, t } = useAzzarT();
  const mission = useWorkbench((s) => s.missions.find((m) => m.id === id));
  const advance = useWorkbench((s) => s.advance);
  const resolve = useWorkbench((s) => s.resolveApproval);
  const cancel = useWorkbench((s) => s.cancelMission);

  if (!mission) {
    return (
      <Page>
        <Empty>{t('notFound')}</Empty>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Link to="/">
            <Btn>{t('back')}</Btn>
          </Link>
        </div>
      </Page>
    );
  }

  const running = mission.status === 'running';
  const pending = mission.approvals.filter((a) => a.status === 'pending');
  const agentName = (agentId: string) => {
    const a = getAgentTemplate(agentId);
    return a ? bi(a.name) : agentId;
  };

  return (
    <Page>
      <Header
        subtitle={`${t('missionDeadline')}: ${mission.deadline} · ${t('cost')}: ${formatUsd(mission.costUsd)} · ${t('budget')}: ${formatUsd(mission.budget.maxTotalCostUsd)}`}
        title={mission.goal}
        actions={
          <Flexbox horizontal align="center" gap={6}>
            <Marker label={statusKey(mission.status)} />
            <Marker label="simulated" />
          </Flexbox>
        }
      />
      <Notice>{t('simulatedNote')}</Notice>

      {/* Pending Approvals */}
      {pending.map((a) => (
        <Card key={a.id} style={{ borderColor: 'var(--ant-color-primary)', borderWidth: 2 }}>
          <Flexbox gap={12}>
            <Flexbox horizontal align="center" gap={8}>
              <Icon icon={AlertTriangle} style={{ color: 'var(--ant-color-primary)' }} />
              <h2 style={{ ...styles.h2, margin: 0 }}>{t('approvalCard')}</h2>
            </Flexbox>
            <strong style={{ fontSize: 15 }}>{bi(a.label)}</strong>
            <p style={styles.muted}>{bi(a.summary)}</p>
            <p style={{ ...styles.muted, fontSize: 12 }}>{t('approvalNote')}</p>
            <Flexbox horizontal align="center" gap={10}>
              <Btn primary onClick={() => resolve(mission.id, a.id, 'approved')}>
                <Icon icon={CheckCircle2} size="small" />
                <span>{t('approve')}</span>
              </Btn>
              <Btn onClick={() => resolve(mission.id, a.id, 'rejected')}>{t('reject')}</Btn>
            </Flexbox>
          </Flexbox>
        </Card>
      ))}

      {/* Mission Controls */}
      <Flexbox horizontal align="center" gap={10} wrap="wrap">
        <Btn disabled={!running} onClick={() => advance(mission.id)}>
          <Icon icon={Play} size="small" />
          <span>{t('step')}</span>
        </Btn>
        <Btn
          primary
          disabled={!running}
          onClick={() => {
            for (let i = 0; i < 80; i++) {
              const m = workbenchSnapshot(mission.id);
              if (!m || m.status !== 'running') break;
              advance(mission.id);
            }
          }}
        >
          <Icon icon={FastForward} size="small" />
          <span>{t('runAll')}</span>
        </Btn>
        <Btn
          disabled={mission.status === 'completed' || mission.status === 'cancelled'}
          onClick={() => cancel(mission.id)}
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
            {mission.activeSpecialists.map((s) => (
              <Marker raw key={s} label={agentName(s)} />
            ))}
          </Flexbox>
        )}
      </Flexbox>

      {/* Goal Graph */}
      <Flexbox gap={10}>
        <h2 style={styles.h2}>{t('goalGraph')}</h2>
        <Flexbox gap={8}>
          {mission.nodes.map((n) => (
            <Card
              key={n.id}
              style={{
                marginInlineStart: n.parentId ? 24 : 0,
                padding: '12px 16px',
              }}
            >
              <Flexbox gap={4}>
                <Flexbox horizontal align="center" justify="space-between">
                  <strong style={{ fontSize: 13 }}>{bi(n.title)}</strong>
                  <Marker raw label={`${n.kind} · ${n.status}`} />
                </Flexbox>
                <span style={{ ...styles.muted, fontSize: 12 }}>{agentName(n.agentId)}</span>
                {n.output && <p style={{ ...styles.muted, marginTop: 4 }}>{bi(n.output)}</p>}
              </Flexbox>
            </Card>
          ))}
        </Flexbox>
      </Flexbox>

      {/* Completion Report */}
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
            {mission.report.blockers.length > 0 && (
              <>
                <strong>{t('reportBlockers')}</strong>
                <BiList items={mission.report.blockers} />
              </>
            )}
            {mission.report.decisions.length > 0 && (
              <>
                <strong>{t('reportDecisions')}</strong>
                <BiList items={mission.report.decisions} />
              </>
            )}
            <strong>{t('reportNext')}</strong>
            <p style={styles.muted}>{bi(mission.report.next)}</p>
          </Flexbox>
        </Card>
      )}

      {/* Reported Actions */}
      {mission.reported.length > 0 && (
        <Card>
          <Flexbox gap={8}>
            <h2 style={{ ...styles.h2, margin: 0 }}>{t('reportedActions')}</h2>
            <BiList items={mission.reported.map((r) => r.text)} />
          </Flexbox>
        </Card>
      )}

      {/* Timeline */}
      <Flexbox gap={8}>
        <h2 style={styles.h2}>{t('timeline')}</h2>
        <Card>
          <Flexbox gap={8}>
            {mission.events.map((e) => (
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

const workbenchSnapshot = (id: string) =>
  workbenchStore.getState().missions.find((m) => m.id === id);

export default MissionPage;
