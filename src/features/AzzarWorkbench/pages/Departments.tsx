import { Flexbox, Icon } from '@azzar/ui';
import { CheckCircle, ExternalLink, Power } from 'lucide-react';
import { type FC } from 'react';
import { Link } from 'react-router';

import { DEPARTMENT_TEMPLATES, type DepartmentTemplate, STARTER_DEPARTMENT_IDS } from '../catalog';
import { useWorkbench } from '../hooks/useWorkbench';
import { useAzzarT } from '../ui/i18n';
import { Btn, Card, DeptAvatar, Header, Marker, Notice, Page, styles } from '../ui/kit';

const DepartmentCard: FC<{ template: DepartmentTemplate }> = ({ template }) => {
  const { bi, t } = useAzzarT();
  const active = useWorkbench((s) => Boolean(s.departments[template.id]?.active));
  const activate = useWorkbench((s) => s.activateDepartment);
  const deactivate = useWorkbench((s) => s.deactivateDepartment);

  return (
    <Card>
      <Flexbox gap={12}>
        <Flexbox horizontal align="center" gap={12}>
          <DeptAvatar department={template} size={44} />
          <Flexbox gap={2}>
            <strong style={{ fontSize: 15 }}>{bi(template.name)}</strong>
            {template.specialistCount > 0 && (
              <span style={styles.muted}>
                {template.specialistCount} {t('specialistsCount')}
              </span>
            )}
          </Flexbox>
        </Flexbox>

        <p style={{ ...styles.muted, minHeight: 40 }}>{bi(template.mission)}</p>

        <Flexbox horizontal align="center" gap={6}>
          <Marker label={template.availability === 'working' ? 'working' : 'comingSoon'} />
          {active && <Marker label="active" />}
        </Flexbox>

        <Flexbox horizontal align="center" gap={8}>
          {active ? (
            <>
              <Link to={`/azzar/departments/${template.id}`}>
                <Btn primary>
                  <Icon icon={ExternalLink} size="small" />
                  <span>{t('open')}</span>
                </Btn>
              </Link>
              <Btn onClick={() => deactivate(template.id)}>
                <Icon icon={Power} size="small" />
                <span>{t('deactivate')}</span>
              </Btn>
            </>
          ) : (
            <Btn primary onClick={() => activate(template.id)}>
              <Icon icon={CheckCircle} size="small" />
              <span>{t('activate')}</span>
            </Btn>
          )}
        </Flexbox>
      </Flexbox>
    </Card>
  );
};

const Departments: FC = () => {
  const { t } = useAzzarT();
  const activate = useWorkbench((s) => s.activateDepartment);
  const core = DEPARTMENT_TEMPLATES.filter((d) => d.avatarKey);
  const more = DEPARTMENT_TEMPLATES.filter((d) => !d.avatarKey);

  return (
    <Page>
      <Header
        actions={<Marker label="groupingNotInfra" />}
        subtitle={t('deptSubtitle')}
        title={t('deptTitle')}
      />
      <Notice>
        <Flexbox
          horizontal
          align="center"
          justify="space-between"
          style={{ width: '100%' }}
          wrap="wrap"
        >
          <div>
            <strong>{t('starterOffer')}</strong> {t('starterOfferNote')}
          </div>
          <Btn onClick={() => STARTER_DEPARTMENT_IDS.forEach((id) => activate(id))}>
            {t('activateStarter')}
          </Btn>
        </Flexbox>
      </Notice>

      <h2 style={styles.h2}>{t('coreDepartments')}</h2>
      <div style={styles.grid}>
        {core.map((d) => (
          <DepartmentCard key={d.id} template={d} />
        ))}
      </div>

      <h2 style={styles.h2}>{t('moreDepartments')}</h2>
      <div style={styles.grid}>
        {more.map((d) => (
          <DepartmentCard key={d.id} template={d} />
        ))}
      </div>
    </Page>
  );
};

export default Departments;
