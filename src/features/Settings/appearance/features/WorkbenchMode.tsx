'use client';

import { Icon, Segmented } from '@azzar/ui';
import { Form, type FormGroupItem, useForm } from '@azzar/ui/form';
import { Building2, User } from 'lucide-react';
import { memo } from 'react';

import { FORM_STYLE } from '@/const/layoutTokens';
import { useWorkbench } from '@/features/AzzarWorkbench/hooks/useWorkbench';
import { useAzzarT } from '@/features/AzzarWorkbench/ui/i18n';
import { SettingsSearchAnchor } from '@/features/SettingsSearch/anchor';

const WorkbenchMode = memo(() => {
  const { t } = useAzzarT();
  const form = useForm();
  const mode = useWorkbench((s) => s.mode);
  const setMode = useWorkbench((s) => s.setMode);
  const isAdmin = useWorkbench((s) => Boolean(s.isAdmin));
  const setAdminMode = useWorkbench((s) => s.setAdminMode);

  const currentMode = mode ?? 'company';

  const workbenchGroup: FormGroupItem = {
    children: [
      {
        children: (
          <Segmented
            value={currentMode}
            options={[
              {
                icon: <Icon icon={Building2} />,
                label: t('modeCompany'),
                value: 'company',
              },
              {
                icon: <Icon icon={User} />,
                label: t('modeIndividual'),
                value: 'individual',
              },
            ]}
            onChange={(val) => setMode(val as 'company' | 'individual')}
          />
        ),
        desc: currentMode === 'company' ? t('modeCompanyDesc') : t('modeIndividualDesc'),
        label: (
          <SettingsSearchAnchor id="appearance-workbench-mode">
            {t('modeTitle')}
          </SettingsSearchAnchor>
        ),
        minWidth: undefined,
      },
      {
        children: (
          <Segmented
            value={isAdmin ? 'admin' : 'user'}
            options={[
              { label: 'User (Default)', value: 'user' },
              { label: 'Admin (CAO Tree)', value: 'admin' },
            ]}
            onChange={(val) => setAdminMode(val === 'admin')}
          />
        ),
        desc: 'Admin-only access for the Chief Agent Orchestrator (CAO) hierarchy tree.',
        label: 'Admin Inspector Mode',
        minWidth: undefined,
      },
    ],
    extra: (
      <span style={{ color: 'var(--ant-color-text-description)', fontSize: 12 }}>
        {t('modeSubtitle')}
      </span>
    ),
    title: 'Azzar Workbench',
  };

  return (
    <Form
      collapsible={false}
      form={form}
      items={[workbenchGroup]}
      itemsType="group"
      {...FORM_STYLE}
    />
  );
});

WorkbenchMode.displayName = 'WorkbenchMode';

export default WorkbenchMode;
