import { Flexbox, Icon } from '@azzar/ui';
import { RefreshCw } from 'lucide-react';
import { type FC, useCallback, useEffect, useState } from 'react';

import { missionService } from '@/services/mission';

import { useWorkbench } from '../hooks/useWorkbench';
import { useAzzarT } from '../ui/i18n';
import { Btn, Empty, Header, Marker, Notice, Page, styles } from '../ui/kit';
import { MissionRow } from '../ui/MissionRow';
import MissionForm from './MissionForm';

/** Home for both modes: the new-mission form, what needs a decision, and every PostgreSQL mission. */
const MissionsHome: FC = () => {
  const { t } = useAzzarT();
  const missions = useWorkbench((s) => s.missions);
  const syncMissions = useWorkbench((s) => s.syncMissions);
  const [loading, setLoading] = useState(false);

  const loadMissions = useCallback(async () => {
    if (process.env.NODE_ENV === 'test') return;
    setLoading(true);
    try {
      const items = await missionService.list(30);
      syncMissions(items.map((i) => i.workbenchMission as any));
    } catch {
      // Keep current store missions if offline in unit tests
    } finally {
      setLoading(false);
    }
  }, [syncMissions]);

  useEffect(() => {
    void loadMissions();
  }, [loadMissions]);

  const waiting = missions.filter((m) => m.status === 'waiting_approval');

  return (
    <Page>
      <Header
        subtitle={t('missionsSubtitle')}
        title={t('missionsTitle')}
        actions={
          <Flexbox horizontal align="center" gap={8} wrap="wrap">
            <Marker label="live" />
            <Btn disabled={loading} onClick={() => void loadMissions()}>
              <Icon icon={RefreshCw} size="small" />
              <span>{loading ? '...' : 'PostgreSQL Sync'}</span>
            </Btn>
          </Flexbox>
        }
      />
      <Notice>{t('liveNote')}</Notice>
      {waiting.length > 0 && (
        <>
          <h2 style={styles.h2}>{t('needsYou')}</h2>
          {waiting.map((m) => (
            <MissionRow key={m.id} mission={m} />
          ))}
        </>
      )}
      <MissionForm onMissionCreated={() => void loadMissions()} />
      <h2 style={styles.h2}>{t('missionsTitle')}</h2>
      {missions.length === 0 ? (
        <Empty>{t('noMissions')}</Empty>
      ) : (
        missions.map((m) => <MissionRow key={m.id} mission={m} />)
      )}
    </Page>
  );
};

export default MissionsHome;
