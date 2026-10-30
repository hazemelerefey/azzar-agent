import { Flexbox, Icon } from '@azzar/ui';
import { CheckCircle, ExternalLink, Power } from 'lucide-react';
import { type FC } from 'react';
import { Link } from 'react-router';

import {
  AGENT_TEMPLATES,
  DEPARTMENT_TEMPLATES,
  type DepartmentTemplate,
  STARTER_DEPARTMENT_IDS,
} from '../catalog';
import { recommendForDepartment } from '../domain/matcher';
import { useWorkbench } from '../hooks/useWorkbench';
import { useAzzarT } from '../ui/i18n';
import { BiList, Btn, Card, DeptAvatar, Header, Marker, Notice, Page, styles } from '../ui/kit';

const DepartmentCard: FC<{ template: DepartmentTemplate }> = ({ template }) => {
  const { bi, t } = useAzzarT();
  const active = useWorkbench((s) => Boolean(s.departments[template.id]?.active));
  const installs = useWorkbench((s) => s.installs);
  const activate = useWorkbench((s) => s.activateDepartment);
  const deactivate = useWorkbench((s) => s.deactivateDepartment);
  const install = useWorkbench((s) => s.installAgent);
  const recs = active ? recommendForDepartment(template, AGENT_TEMPLATES, installs) : [];

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
          <Marker label={template.availability === 'available' ? 'available' : 'comingSoon'} />
          {active && <Marker label="active" />}
        </Flexbox>

        {active && recs.length > 0 && (
          <div
            style={{
              backgroundColor: 'var(--ant-color-fill-quaternary)',
              border: '1px solid var(--ant-color-border-secondary)',
              borderRadius: 8,
              padding: 10,
            }}
          >
            <strong style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>
              {t('recommended')} ({recs.length}) — {t('recommendedWhy')}
            </strong>
            {recs.slice(0, 2).map((r) => (
              <div key={r.agent.id} style={{ fontSize: 12, marginBottom: 6 }}>
                <div style={{ ...styles.row, justifyContent: 'space-between' }}>
                  <span>
                    <strong>{bi(r.agent.name)}</strong> ({r.matchedTags.join(', ')})
                  </span>
                  <Marker
                    label={r.agent.availability === 'available' ? 'available' : 'comingSoon'}
                  />
                </div>
                <BiList items={r.reasons.slice(0, 2).map((x) => x.does)} />
                {r.agent.kind === 'manager' &&
                  r.agent.availability === 'available' &&
                  !r.installed && (
                    <Btn
                      primary
                      onClick={() => install(r.agent.id, { departmentId: template.id })}
                    >
                      {t('install')}
                    </Btn>
                  )}
              </div>
            ))}
          </div>
        )}

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
