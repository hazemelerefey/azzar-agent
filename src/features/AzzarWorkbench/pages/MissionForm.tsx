import { Flexbox, Icon } from '@azzar/ui';
import { Flag, Play, Shield, Target } from 'lucide-react';
import { type FC, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { missionService } from '@/services/mission';

import { getDepartmentTemplate, MISSION_TEMPLATES } from '../catalog';
import { useWorkbench } from '../hooks/useWorkbench';
import { errorKey } from '../ui/errors';
import { useAzzarT } from '../ui/i18n';
import { Btn, Card, Field, Marker, Notice, styles } from '../ui/kit';

const ownerKey = (type: string, id: string) => `${type}:${id}`;

/** The new-mission form: goal, owner, deadline, approvals, success criteria — wired to PostgreSQL MissionEngine via tRPC. */
const MissionForm: FC<{ onMissionCreated?: () => void }> = ({ onMissionCreated }) => {
  const { bi, t } = useAzzarT();
  const navigate = useNavigate();
  const mode = useWorkbench((s) => s.mode);
  const departments = useWorkbench((s) => s.departments);
  const projects = useWorkbench((s) => s.projects);
  const installs = useWorkbench((s) => s.installs);
  const missions = useWorkbench((s) => s.missions);
  const syncMissions = useWorkbench((s) => s.syncMissions);
  const validateMissionLaunch = useWorkbench((s) => s.validateMissionLaunch);

  const owners = useMemo(() => {
    const list: Array<{
      departmentId: string | null;
      id: string;
      key: string;
      label: string;
      type: 'department' | 'project' | 'self';
    }> = [];
    if (mode === 'company') {
      for (const d of Object.values(departments).filter((x) => x.active)) {
        const tpl = getDepartmentTemplate(d.templateId);
        list.push({
          departmentId: d.templateId,
          id: d.templateId,
          key: ownerKey('department', d.templateId),
          label: tpl ? bi(d.customName ?? tpl.name) : d.templateId,
          type: 'department',
        });
      }
    } else {
      list.push({
        departmentId: null,
        id: 'me',
        key: ownerKey('self', 'me'),
        label: t('modeIndividual'),
        type: 'self',
      });
    }
    for (const p of projects.filter((x) => (mode === 'company' ? true : x.departmentId === null))) {
      list.push({
        departmentId: p.departmentId,
        id: p.id,
        key: ownerKey('project', p.id),
        label: p.name,
        type: 'project',
      });
    }
    return list;
  }, [mode, departments, projects, bi, t]);

  const [ownerSel, setOwnerSel] = useState('');
  const owner = owners.find((o) => o.key === ownerSel) ?? owners[0];

  const scripts = useMemo(
    () =>
      MISSION_TEMPLATES.filter(
        (s) =>
          Boolean(installs[s.managerId]) &&
          (mode === 'individual' || !owner?.departmentId || owner.departmentId === s.departmentId),
      ),
    [installs, mode, owner],
  );

  const [scriptId, setScriptId] = useState('');
  const script = scripts.find((s) => s.id === scriptId) ?? scripts[0];

  const [goal, setGoal] = useState('');
  const [deadline, setDeadline] = useState('');
  const [criteria, setCriteria] = useState('');
  const [approvals, setApprovals] = useState<string[]>([]);
  const [modelId, setModelId] = useState('gemma4:e4b');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const manager = script ? installs[script.managerId] : undefined;
  const suggested = useMemo(() => {
    if (!script) return [];
    return script.suggestedApprovals;
  }, [script]);

  if (!owner || !script || !manager) {
    return (
      <Card>
        <Flexbox gap={12}>
          <div style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
            <Icon icon={Flag} size="small" style={{ color: 'var(--ant-color-primary)' }} />
            <strong>{t('setupFirst')}</strong>
          </div>
          <ol style={{ margin: 0, paddingInlineStart: 20 }}>
            <li style={styles.muted}>
              {mode === 'company' ? t('setupInstall') : t('setupInstallIndividual')}
            </li>
            {mode === 'company' && <li style={styles.muted}>{t('setupActivate')}</li>}
            {mode === 'company' && <li style={styles.muted}>{t('setupAssign')}</li>}
          </ol>
        </Flexbox>
      </Card>
    );
  }

  const submit = async () => {
    const valid = validateMissionLaunch({
      approvalsNeeded: approvals,
      deadline,
      goal,
      modelId,
      ownerId: owner.id,
      ownerType: owner.type,
      scriptId: script.id,
      successCriteria: criteria
        .split('\n')
        .map((c) => c.trim())
        .filter(Boolean),
    });
    if (!valid.ok) {
      setError(t(errorKey(valid.reason)));
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await missionService.createAndRun({
        departmentId: valid.value.departmentId ?? undefined,
        goal: goal.trim(),
        managerId: script.managerId,
        mode: mode ?? 'company',
        modelId,
        projectId: valid.value.projectId,
        scriptId: script.id,
      });
      if (res.detail?.workbenchMission) {
        syncMissions([res.detail.workbenchMission as any, ...missions]);
      }
      onMissionCreated?.();
      void navigate(`/azzar/missions/${res.missionId}`);
    } catch (err: any) {
      setError(err?.message || t('errGeneric'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <Flexbox gap={20}>
        {/* Header */}
        <Flexbox horizontal align="center" justify="space-between" wrap="wrap">
          <Flexbox horizontal align="center" gap={8}>
            <Icon icon={Target} style={{ color: 'var(--ant-color-primary)' }} />
            <h2 style={{ ...styles.h2, margin: 0 }}>{t('newMission')}</h2>
          </Flexbox>
          <Marker label="live" />
        </Flexbox>

        {/* Configuration Row */}
        <div
          style={{
            display: 'grid',
            gap: 16,
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          }}
        >
          <Field label={t('missionScript')}>
            <select
              style={{ ...styles.field, ...styles.select }}
              value={script.id}
              onChange={(e) => setScriptId(e.target.value)}
            >
              {scripts.map((s) => (
                <option key={s.id} value={s.id}>
                  {bi(s.title)}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t('missionOwner')}>
            <select
              style={{ ...styles.field, ...styles.select }}
              value={owner.key}
              onChange={(e) => setOwnerSel(e.target.value)}
            >
              {owners.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t('modelChoice')}>
            <select
              style={{ ...styles.field, ...styles.select }}
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
            >
              <option value="gemma4:e4b">Gemma 4 e4b (Ollama · Verified Default)</option>
              <option value="qwen2.5:7b">Qwen 2.5 7B (Ollama · Multilingual)</option>
              <option value="qwen2.5:14b">Qwen 2.5 14B (Ollama · Reasoning)</option>
              <option value="qwen3:4b-instruct">Qwen 3 4B Instruct (Ollama · Compact)</option>
            </select>
          </Field>
        </div>

        <p style={{ ...styles.muted, fontSize: 12, marginTop: -8 }}>{bi(script.description)}</p>

        {/* Goal and Deadline */}
        <Field label={t('missionGoal')}>
          <textarea
            placeholder="e.g. Launch campaign brief for an Egyptian brand"
            rows={2}
            style={styles.field}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
        </Field>

        <div
          style={{
            display: 'grid',
            gap: 16,
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          }}
        >
          <Field label={t('missionDeadline')}>
            <div style={{ alignItems: 'center', display: 'flex', gap: 8, position: 'relative' }}>
              <input
                style={styles.field}
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </Field>

          <Field hint={t('missionCriteriaHint')} label={t('missionCriteria')}>
            <textarea
              placeholder={script.defaultSuccessCriteria.map((c) => bi(c)).join('\n')}
              rows={3}
              style={styles.field}
              value={criteria}
              onChange={(e) => setCriteria(e.target.value)}
            />
          </Field>
        </div>

        {/* Extra Approvals */}
        {suggested.length > 0 && (
          <Flexbox gap={8}>
            <Flexbox horizontal align="center" gap={6}>
              <Icon
                icon={Shield}
                size="small"
                style={{ color: 'var(--ant-color-text-secondary)' }}
              />
              <span style={{ fontSize: 13, fontWeight: 600 }}>{t('missionApprovals')}</span>
            </Flexbox>
            <p style={styles.muted}>{t('missionApprovalsHint')}</p>
            <div
              style={{
                display: 'grid',
                gap: 8,
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              }}
            >
              {suggested.map((toolId) => (
                <label
                  key={toolId}
                  style={{
                    ...styles.field,
                    alignItems: 'center',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: 8,
                    padding: '8px 12px',
                  }}
                >
                  <input
                    checked={approvals.includes(toolId)}
                    style={{ accentColor: 'var(--ant-color-primary)', cursor: 'pointer' }}
                    type="checkbox"
                    onChange={(e) =>
                      setApprovals((cur) =>
                        e.target.checked ? [...cur, toolId] : cur.filter((x) => x !== toolId),
                      )
                    }
                  />
                  <code style={{ fontSize: 12 }}>{toolId}</code>
                </label>
              ))}
            </div>
          </Flexbox>
        )}

        {error && <Notice>{error}</Notice>}

        {/* Action Button */}
        <div>
          <Btn primary disabled={submitting} onClick={() => void submit()}>
            <Icon icon={Play} size="small" />
            <span>{submitting ? t('generatingStep') : t('launch')}</span>
          </Btn>
        </div>
      </Flexbox>
    </Card>
  );
};

export default MissionForm;
