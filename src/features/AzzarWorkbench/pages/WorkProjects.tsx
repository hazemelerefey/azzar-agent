import { type FC, useState } from 'react';

import { getDepartmentTemplate } from '../catalog';
import { effectiveProjectContext } from '../domain/memory';
import { useWorkbench } from '../hooks/useWorkbench';
import { errorKey } from '../ui/errors';
import { useAzzarT } from '../ui/i18n';
import { Btn, Card, Empty, Field, Header, Marker, Notice, Page, styles } from '../ui/kit';

/** Project list, create form and per-project inheritance. `fixedDepartmentId` scopes it to a hub. */
const WorkProjects: FC<{ embedded?: boolean; fixedDepartmentId?: string }> = ({
  embedded,
  fixedDepartmentId,
}) => {
  const { bi, t } = useAzzarT();
  const mode = useWorkbench((s) => s.mode);
  const projects = useWorkbench((s) => s.projects);
  const departments = useWorkbench((s) => s.departments);
  const create = useWorkbench((s) => s.createProject);
  const update = useWorkbench((s) => s.updateProject);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dept, setDept] = useState<string>(fixedDepartmentId ?? '');
  const [error, setError] = useState<string | null>(null);

  const shown = projects.filter((p) =>
    fixedDepartmentId
      ? p.departmentId === fixedDepartmentId
      : mode === 'company'
        ? true
        : p.departmentId === null,
  );
  const activeDepartments = Object.values(departments).filter((d) => d.active);

  const body = (
    <>
      <Card>
        <h2 style={styles.h2}>{t('newProject')}</h2>
        <Field label={t('projectName')}>
          <input style={styles.field} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label={t('projectDescription')}>
          <textarea
            rows={2}
            style={styles.field}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        {mode === 'company' && !fixedDepartmentId && (
          <Field label={t('projectDepartment')}>
            <select style={styles.field} value={dept} onChange={(e) => setDept(e.target.value)}>
              <option value="">{t('standalone')}</option>
              {activeDepartments.map((d) => (
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
          </Field>
        )}
        {error && <Notice>{error}</Notice>}
        <div>
          <Btn
            primary
            onClick={() => {
              const r = create({
                departmentId: mode === 'company' ? dept || null : null,
                description,
                name,
              });
              if (r.ok) {
                setName('');
                setDescription('');
                setError(null);
              } else setError(t(errorKey(r.reason)));
            }}
          >
            {t('create')}
          </Btn>
        </div>
      </Card>
      {shown.length === 0 && <Empty>{t('noProjects')}</Empty>}
      {shown.map((p) => {
        const d = p.departmentId ? departments[p.departmentId] : undefined;
        const ctx = effectiveProjectContext(p, d);
        return (
          <Card key={p.id}>
            <div style={{ ...styles.row, justifyContent: 'space-between' }}>
              <strong>{p.name}</strong>
              <div style={styles.row}>
                <Marker label={p.visibility === 'private' ? 'privateByDefault' : 'shared'} />
                {p.departmentId && (
                  <Marker
                    raw
                    label={bi(
                      getDepartmentTemplate(p.departmentId)?.name ?? {
                        ar: p.departmentId,
                        en: p.departmentId,
                      },
                    )}
                  />
                )}
              </div>
            </div>
            {p.description && <p style={styles.muted}>{p.description}</p>}
            {p.departmentId && (
              <>
                <strong style={{ fontSize: 13 }}>{t('inheritTitle')}</strong>
                <div style={styles.row}>
                  {(['policies', 'tone', 'sources'] as const).map((k) => (
                    <label
                      key={k}
                      style={{ alignItems: 'center', display: 'flex', fontSize: 13, gap: 4 }}
                    >
                      <input
                        checked={p.inherit[k]}
                        type="checkbox"
                        onChange={(e) =>
                          update(p.id, { inherit: { ...p.inherit, [k]: e.target.checked } })
                        }
                      />
                      {t(
                        k === 'policies'
                          ? 'inheritPolicies'
                          : k === 'tone'
                            ? 'inheritTone'
                            : 'inheritSources',
                      )}
                    </label>
                  ))}
                </div>
                <strong style={{ fontSize: 13 }}>{t('effectiveContext')}</strong>
                {ctx.policies || ctx.tone || ctx.sources.length > 0 ? (
                  <p style={styles.muted}>
                    {[ctx.policies, ctx.tone, ...ctx.sources.map((s) => s.name)]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                ) : (
                  <p style={styles.muted}>{t('nothingInherited')}</p>
                )}
              </>
            )}
            <Field label={t('projectContext')}>
              <textarea
                rows={2}
                style={styles.field}
                value={p.context}
                onChange={(e) => update(p.id, { context: e.target.value })}
              />
            </Field>
            <div style={styles.row}>
              <label style={{ alignItems: 'center', display: 'flex', fontSize: 13, gap: 4 }}>
                <input
                  checked={p.visibility === 'shared'}
                  type="checkbox"
                  onChange={(e) =>
                    update(p.id, { visibility: e.target.checked ? 'shared' : 'private' })
                  }
                />
                {t('shared')}
              </label>
            </div>
          </Card>
        );
      })}
    </>
  );

  if (embedded) return body;
  return (
    <Page>
      <Header subtitle={t('projectsSubtitle')} title={t('projectsTitle')} />
      {body}
    </Page>
  );
};

export default WorkProjects;
