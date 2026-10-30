import { Flexbox, Icon } from '@azzar/ui';
import { Calendar, DollarSign, Target } from 'lucide-react';
import { type FC } from 'react';
import { Link } from 'react-router';

import { getMissionTemplate } from '../catalog';
import type { Mission } from '../domain/types';
import { type AzzarKey, useAzzarT } from './i18n';
import { Card, formatUsd, Marker } from './kit';

const STATUS_KEY: Record<Mission['status'], AzzarKey> = {
  cancelled: 'statusCancelled',
  completed: 'statusCompleted',
  running: 'statusRunning',
  waiting_approval: 'statusWaiting',
};

export const statusKey = (s: Mission['status']): AzzarKey => STATUS_KEY[s];

export const MissionRow: FC<{ mission: Mission }> = ({ mission }) => {
  const { bi, t } = useAzzarT();
  const script = getMissionTemplate(mission.scriptId);

  return (
    <Card style={{ padding: '16px 20px' }}>
      <Flexbox gap={10}>
        <Flexbox horizontal align="center" justify="space-between" wrap="wrap">
          <Flexbox horizontal align="center" gap={10}>
            <div
              style={{
                alignItems: 'center',
                backgroundColor: 'var(--ant-color-fill-secondary)',
                borderRadius: 8,
                color: 'var(--ant-color-primary)',
                display: 'flex',
                height: 32,
                justifyContent: 'center',
                width: 32,
              }}
            >
              <Icon icon={Target} size="small" />
            </div>
            <Link
              to={`/azzar/missions/${mission.id}`}
              style={{
                color: 'var(--ant-color-text)',
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              {mission.goal}
            </Link>
          </Flexbox>

          <Flexbox horizontal align="center" gap={6}>
            <Marker label={statusKey(mission.status)} />
            <Marker label="live" />
          </Flexbox>
        </Flexbox>

        <Flexbox
          horizontal
          align="center"
          gap={16}
          style={{ color: 'var(--ant-color-text-secondary)', fontSize: 12 }}
          wrap="wrap"
        >
          <span>{script ? bi(script.title) : mission.scriptId}</span>
          <span style={{ alignItems: 'center', display: 'inline-flex', gap: 4 }}>
            <Icon icon={Calendar} size={12} />
            {t('missionDeadline')}: {mission.deadline}
          </span>
          <span style={{ alignItems: 'center', display: 'inline-flex', gap: 4 }}>
            <Icon icon={DollarSign} size={12} />
            {t('cost')}: {formatUsd(mission.costUsd)}
          </span>
        </Flexbox>
      </Flexbox>
    </Card>
  );
};
