import { type FC, useState } from 'react';
import { Link, useParams } from 'react-router';

import { AGENT_TEMPLATES, getAgentTemplate, getDepartmentTemplate } from '../catalog';
import { recommendForDepartment } from '../domain/matcher';
import { visibleMemory } from '../domain/memory';
import { useWorkbench } from '../hooks/useWorkbench';
import { type AzzarKey, useAzzarT } from '../ui/i18n';
import {
  BiList,
  Btn,
  Card,
  DeptAvatar,
  Empty,
  Field,
  Header,
  Marker,
  Notice,
  Page,
  styles,
  Tabs,
} from '../ui/kit';
import { MissionRow } from '../ui/MissionRow';
import { RulesConsole } from '../ui/RulesConsole';
import WorkProjects from './WorkProjects';

const LAYER_KEY: Record<string, AzzarKey> = {
  agent: 'layerAgent',
  department: 'layerDepartment',
  global: 'layerGlobal',
  mission: 'layerMission',
  project: 'layerProject',
};

const DepartmentHub: FC = () => {
  const { id = '' } = useParams();
  const { bi, t } = useAzzarT();
  const [tab, setTab] = useState('overview');
  const template = getDepartmentTemplate(id);
  const dept = useWorkbench((s) => s.departments[id]);
  const installs = useWorkbench((s) => s.installs);
  const data = useWorkbench((s) => s);
  // Select the stable array and filter in render: a selector that returns a new array loops forever.
  const allMissions = useWorkbench((s) => s.missions);
  const missions = allMissions.filter((m) => m.departmentId === id);
  const update = useWorkbench((s) => s.updateDepartment);
  const setRules = useWorkbench((s) => s.setDepartmentRules);
  const install = useWorkbench((s) => s.installAgent);
  const [sourceName, setSourceName] = useState('');
  const [sourceContent, setSourceContent] = useState('');
  const [sourceShare, setSourceShare] = useState(false);

  if (!template)
    return (
      <Page>
        <Empty>{t('notFound')}</Empty>
      </Page>
    );
  if (!dept?.active) {
    return (
      <Page>
        <Header title={bi(template.name)} />
        <Empty>{t('notActive')}</Empty>
        <Link to="/azzar/departments">
          <Btn>{t('navDepartments')}</Btn>
        </Link>
      </Page>
    );
  }

  const available = template.availability === 'available';
  const recs = recommendForDepartment(template, AGENT_TEMPLATES, installs);
  const managerIds = template.managerId && available ? [template.managerId] : [];
  const memory = visibleMemory(data, { departmentId: id }).filter(
    (m) => m.layer === 'department' || m.layer === 'global',
  );
  const assigned = Object.values(installs).filter((i) => i.departmentIds.includes(id));

  return (
    <Page>
      <Header
        actions={<Marker label={available ? 'available' : 'comingSoon'} />}
        subtitle={bi(template.mission)}
        title={bi(dept.customName ?? template.name)}
      />
      <div style={{ alignItems: 'center', display: 'flex', gap: 10 }}>
        <DeptAvatar department={template} size={48} />
        <Marker label="groupingNotInfra" />
      </div>
      {!available && <Notice>{t('templateOnly')}</Notice>}
      <Tabs
        active={tab}
        items={[
          { key: 'overview', label: t('tabOverview') },
          { key: 'projects', label: t('tabProjects') },
          { key: 'agents', label: t('tabAgents') },
          { key: 'sources', label: t('tabSources') },
          { key: 'context', label: t('tabContext') },
          { key: 'memory', label: t('tabMemory') },
          { key: 'missions', label: t('tabMissions') },
          { key: 'rules', label: t('tabRules') },
        ]}
        onChange={setTab}
      />

      {tab === 'overview' && (
        <>
          <strong>{t('deptDoes')}</strong>
          <BiList items={template.does.map((d) => d.text)} />
          <strong>{t('deptDoesNot')}</strong>
          <BiList items={template.doesNot} />
          <strong>{t('examples')}</strong>
          <BiList items={template.exampleMissions} />
        </>
      )}

      {tab === 'projects' && <WorkProjects embedded fixedDepartmentId={id} />}

      {tab === 'agents' && (
        <>
          <h2 style={styles.h2}>{t('recommended')}</h2>
          {recs.length === 0 && <Empty>{t('templateOnly')}</Empty>}
          {recs.map((r) => (
            <Card key={r.agent.id}>
              <div style={{ ...styles.row, justifyContent: 'space-between' }}>
                <strong>{bi(r.agent.name)}</strong>
                <Marker label={r.agent.availability === 'available' ? 'available' : 'comingSoon'} />
              </div>
              <span style={styles.muted}>{t('recommendedWhy')}</span>
              <BiList items={r.reasons.map((x) => x.does)} />
              {r.agent.kind === 'manager' && r.agent.availability === 'available' && !r.installed && (
                <div>
                  <Btn primary onClick={() => install(r.agent.id, { departmentId: id })}>
                    {t('install')}
                  </Btn>
                </div>
              )}
              {r.installed && <Marker label="installed" />}
            </Card>
          ))}
          <h2 style={styles.h2}>{t('navAgents')}</h2>
          {assigned.length === 0 ? (
            <Empty>{t('nowhere')}</Empty>
          ) : (
            assigned.map((i) => (
              <Card key={i.templateId}>
                <strong>
                  {bi(
                    getAgentTemplate(i.templateId)?.name ?? { ar: i.templateId, en: i.templateId },
                  )}
                </strong>
              </Card>
            ))
          )}
        </>
      )}

      {tab === 'sources' && (
        <>
          {dept.sources.length === 0 && <Empty>{t('noSources')}</Empty>}
          {dept.sources.map((s) => (
            <Card key={s.id}>
              <div style={{ ...styles.row, justifyContent: 'space-between' }}>
                <strong>{s.name}</strong>
                <div style={styles.row}>
                  {s.shareable && <Marker label="shareable" />}
                  <Btn
                    onClick={() =>
                      update(id, { sources: dept.sources.filter((x) => x.id !== s.id) })
                    }
                  >
                    {t('remove')}
                  </Btn>
                </div>
              </div>
              {s.content && <p style={styles.muted}>{s.content}</p>}
            </Card>
          ))}
          <Card>
            <h2 style={styles.h2}>{t('addSource')}</h2>
            <Field label={t('sourceName')}>
              <input
                style={styles.field}
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
              />
            </Field>
            <Field label={t('sourceContent')}>
              <textarea
                rows={2}
                style={styles.field}
                value={sourceContent}
                onChange={(e) => setSourceContent(e.target.value)}
              />
            </Field>
            <label style={{ alignItems: 'center', display: 'flex', fontSize: 13, gap: 6 }}>
              <input
                checked={sourceShare}
                type="checkbox"
                onChange={(e) => setSourceShare(e.target.checked)}
              />
              {t('shareable')}
            </label>
            <div>
              <Btn
                primary
                disabled={!sourceName.trim()}
                onClick={() => {
                  update(id, {
                    sources: [
                      ...dept.sources,
                      {
                        content: sourceContent,
                        id: `src_${Date.now().toString(36)}`,
                        kind: /^https?:\/\//.test(sourceContent) ? 'link' : 'note',
                        name: sourceName.trim(),
                        shareable: sourceShare,
                      },
                    ],
                  });
                  setSourceName('');
                  setSourceContent('');
                  setSourceShare(false);
                }}
              >
                {t('addSource')}
              </Btn>
            </div>
          </Card>
        </>
      )}

      {tab === 'context' && (
        <>
          <Field label={t('contextField')}>
            <textarea
              rows={4}
              style={styles.field}
              value={dept.context}
              onChange={(e) => update(id, { context: e.target.value })}
            />
          </Field>
          <Field label={t('instructionsField')}>
            <textarea
              rows={4}
              style={styles.field}
              value={dept.instructions}
              onChange={(e) => update(id, { instructions: e.target.value })}
            />
          </Field>
          <Field label={t('toneField')}>
            <input
              style={styles.field}
              value={dept.tone}
              onChange={(e) => update(id, { tone: e.target.value })}
            />
          </Field>
        </>
      )}

      {tab === 'memory' && (
        <>
          <Notice>{t('memoryNote')}</Notice>
          {memory.length === 0 && <Empty>{t('noMemory')}</Empty>}
          {memory.map((m) => (
            <Card key={m.id}>
              <Marker label={LAYER_KEY[m.layer] ?? 'layerMission'} />
              <p style={styles.muted}>{bi(m.text)}</p>
            </Card>
          ))}
        </>
      )}

      {tab === 'missions' &&
        (missions.length === 0 ? (
          <Empty>{t('noMissions')}</Empty>
        ) : (
          missions.map((m) => <MissionRow key={m.id} mission={m} />)
        ))}

      {tab === 'rules' && (
        <RulesConsole
          showIsolationNote
          managerIds={managerIds}
          rules={dept.rules}
          onChange={(r) => setRules(id, r)}
        />
      )}
    </Page>
  );
};

export default DepartmentHub;
