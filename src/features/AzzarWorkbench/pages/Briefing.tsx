import { type FC, useEffect } from 'react';
import { Link } from 'react-router';

import { missionService } from '@/services/mission';

import { buildBriefing, completedSince } from '../domain/briefing';
import { useWorkbench } from '../hooks/useWorkbench';
import { useAzzarT } from '../ui/i18n';
import { Btn, Card, Empty, Header, Marker, Notice, Page, styles } from '../ui/kit';
import { MissionRow } from '../ui/MissionRow';

const Briefing: FC = () => {
  const { bi, t } = useAzzarT();
  const data = useWorkbench((s) => s);
  const markSeen = useWorkbench((s) => s.markBriefingSeen);
  const syncMissions = useWorkbench((s) => s.syncMissions);

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') return;
    missionService
      .list(30)
      .then((items) => syncMissions(items.map((i) => i.workbenchMission as any)))
      .catch(() => {});
  }, [syncMissions]);

  const mode = data.mode ?? 'company';
  const briefing = buildBriefing(data, mode, new Date().toISOString());
  const newOnes = completedSince(data, data.lastSeenAt);

  return (
    <Page>
      <Header
        subtitle={mode === 'company' ? t('briefSubtitle') : t('briefSubtitleIndividual')}
        title={t('briefTitle')}
        actions={
          <>
            <Marker label="live" />
            <Btn onClick={markSeen}>{t('markSeen')}</Btn>
          </>
        }
      />
      {briefing.needsDecisionCount > 0 && (
        <Notice>
          {briefing.needsDecisionCount} {t('decisionsCount')}
        </Notice>
      )}
      {newOnes.length > 0 && (
        <>
          <h2 style={styles.h2}>{t('newSinceLast')}</h2>
          {newOnes.map((m) => (
            <MissionRow key={m.id} mission={m} />
          ))}
        </>
      )}
      {briefing.sections.length === 0 && <Empty>{t('briefEmpty')}</Empty>}
      {briefing.sections.map((s) => (
        <Card key={s.departmentId ?? s.title.en}>
          <h2 style={styles.h2}>{bi(s.title)}</h2>
          {s.needsDecision.length > 0 && (
            <>
              <strong>{t('briefNeeds')}</strong>
              {s.needsDecision.map((n, i) => (
                <div key={i} style={styles.muted}>
                  <Link to={`/azzar/missions/${n.mission.id}`}>{n.mission.goal}</Link>:{' '}
                  {bi((n.approval?.label ?? n.blocker?.text) as { ar: string; en: string })}
                </div>
              ))}
            </>
          )}
          {s.running.length > 0 && (
            <>
              <strong>{t('briefRunning')}</strong>
              {s.running.map((m) => (
                <div key={m.id} style={styles.muted}>
                  <Link to={`/azzar/missions/${m.id}`}>{m.goal}</Link>
                </div>
              ))}
            </>
          )}
          {s.completed.length > 0 && (
            <>
              <strong>{t('briefCompleted')}</strong>
              {s.completed.map((m) => (
                <div key={m.id} style={styles.muted}>
                  <Link to={`/azzar/missions/${m.id}`}>{m.goal}</Link>
                  {m.report ? ` — ${bi(m.report.outcome)}` : ''}
                </div>
              ))}
            </>
          )}
          {s.reported.length > 0 && (
            <>
              <strong>{t('briefReported')}</strong>
              {s.reported.map((r) => (
                <div key={r.action.id} style={styles.muted}>
                  {bi(r.action.text)}
                </div>
              ))}
            </>
          )}
        </Card>
      ))}
    </Page>
  );
};

export default Briefing;
