import { Flexbox, Icon } from '@azzar/ui';
import { RotateCcw } from 'lucide-react';
import { type FC } from 'react';

import { useWorkbench } from '../hooks/useWorkbench';
import { useAzzarT } from '../ui/i18n';
import { Btn, Empty, Header, Notice, Page, styles } from '../ui/kit';
import { MissionRow } from '../ui/MissionRow';
import MissionForm from './MissionForm';

/** Home for both modes: the new-mission form, what needs a decision, and every mission. */
const MissionsHome: FC = () => {
  const { t } = useAzzarT();
  const missions = useWorkbench((s) => s.missions);
  const reset = useWorkbench((s) => s.reset);
  const waiting = missions.filter((m) => m.status === 'waiting_approval');
  const hasLive = missions.some((m) => m.executionMode === 'live' || !m.simulated);

  return (
    <Page>
      <Header
        subtitle={t('missionsSubtitle')}
        title={t('missionsTitle')}
        actions={
          <Flexbox horizontal wrap align="center" gap={8}>
            <Btn
              onClick={() => {
                if (window.confirm(t('resetConfirm'))) reset();
              }}
            >
              <Icon icon={RotateCcw} size="small" />
              <span>{t('resetDemo')}</span>
            </Btn>
          </Flexbox>
        }
      />
      <Notice>{hasLive ? t('liveNote') : t('simulatedNote')}</Notice>
      {waiting.length > 0 && (
        <>
          <h2 style={styles.h2}>{t('needsYou')}</h2>
          {waiting.map((m) => (
            <MissionRow key={m.id} mission={m} />
          ))}
        </>
      )}
      <MissionForm />
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
