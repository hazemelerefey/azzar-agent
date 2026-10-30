import { Flexbox, Icon } from '@azzar/ui';
import { Bot, Trash2 } from 'lucide-react';
import { type FC } from 'react';
import { Link } from 'react-router';

import { getAgentTemplate, getDepartmentTemplate } from '../catalog';
import { useWorkbench } from '../hooks/useWorkbench';
import { useAzzarT } from '../ui/i18n';
import { Btn, Card, Empty, Header, Marker, Page, styles } from '../ui/kit';

const MyAgents: FC = () => {
  const { bi, t } = useAzzarT();
  const mode = useWorkbench((s) => s.mode);
  const installs = useWorkbench((s) => s.installs);
  const departments = useWorkbench((s) => s.departments);
  const projects = useWorkbench((s) => s.projects);
  const assign = useWorkbench((s) => s.assignAgent);
  const unassign = useWorkbench((s) => s.unassignAgent);
  const uninstall = useWorkbench((s) => s.uninstallAgent);
  const list = Object.values(installs);
  const activeDepartments = Object.values(departments).filter((d) => d.active);
  const visibleProjects = projects.filter((p) => mode === 'company' || p.departmentId === null);

  return (
    <Page>
      <Header subtitle={`${t('agentsSubtitle')} ${t('alsoMultiple')}`} title={t('agentsTitle')} />
      {list.length === 0 ? (
        <>
          <Empty>{t('noAgents')}</Empty>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Link to="/azzar/marketplace">
              <Btn primary>{t('goMarketplace')}</Btn>
            </Link>
          </div>
        </>
      ) : (
        list.map((inst) => {
          const tpl = getAgentTemplate(inst.templateId);
          if (!tpl) return null;
          const nowhere =
            (mode === 'company' ? inst.departmentIds.length : 0) + inst.projectIds.length === 0;
          return (
            <Card key={inst.templateId}>
              <Flexbox gap={12}>
                <Flexbox horizontal align="center" justify="space-between">
                  <Flexbox horizontal align="center" gap={10}>
                    <div
                      style={{
                        alignItems: 'center',
                        backgroundColor: 'var(--ant-color-fill-secondary)',
                        borderRadius: 8,
                        color: 'var(--ant-color-primary)',
                        display: 'flex',
                        height: 36,
                        justifyContent: 'center',
                        width: 36,
                      }}
                    >
                      <Icon icon={Bot} size={18} />
                    </div>
                    <strong style={{ fontSize: 15 }}>{bi(tpl.name)}</strong>
                  </Flexbox>
                  <Marker label="available" />
                </Flexbox>

                <span style={styles.muted}>
                  {t('worksIn')}: {nowhere && t('nowhere')}
                </span>

                <Flexbox horizontal align="center" gap={8} wrap="wrap">
                  {mode === 'company' &&
                    inst.departmentIds.map((id) => (
                      <span key={id} style={styles.row}>
                        <Marker
                          raw
                          label={bi(getDepartmentTemplate(id)?.name ?? { ar: id, en: id })}
                        />
                        <Btn onClick={() => unassign(inst.templateId, { departmentId: id })}>
                          {t('unassign')}
                        </Btn>
                      </span>
                    ))}
                  {inst.projectIds.map((id) => (
                    <span key={id} style={styles.row}>
                      <Marker raw label={projects.find((p) => p.id === id)?.name ?? id} />
                      <Btn onClick={() => unassign(inst.templateId, { projectId: id })}>
                        {t('unassign')}
                      </Btn>
                    </span>
                  ))}
                </Flexbox>

                <Flexbox horizontal align="center" gap={10} wrap="wrap">
                  {mode === 'company' && (
                    <select
                      style={{ ...styles.field, maxWidth: 240 }}
                      value=""
                      onChange={(e) =>
                        e.target.value && assign(inst.templateId, { departmentId: e.target.value })
                      }
                    >
                      <option value="">{t('assignDepartment')}</option>
                      {activeDepartments
                        .filter((d) => !inst.departmentIds.includes(d.templateId))
                        .map((d) => (
                          <option key={d.templateId} value={d.templateId}>
                            {bi(
                              d.customName ??
                                getDepartmentTemplate(d.templateId)?.name ?? {
                                  ar: d.templateId,
                                  en: d.templateId,
                                },
                            )}
                          </option>
                        ))}
                    </select>
                  )}
                  <select
                    style={{ ...styles.field, maxWidth: 240 }}
                    value=""
                    onChange={(e) =>
                      e.target.value && assign(inst.templateId, { projectId: e.target.value })
                    }
                  >
                    <option value="">{t('assignProject')}</option>
                    {visibleProjects
                      .filter((p) => !inst.projectIds.includes(p.id))
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                  <Btn onClick={() => uninstall(inst.templateId)}>
                    <Icon icon={Trash2} size="small" />
                    <span>{t('uninstall')}</span>
                  </Btn>
                </Flexbox>
              </Flexbox>
            </Card>
          );
        })
      )}
    </Page>
  );
};

export default MyAgents;
