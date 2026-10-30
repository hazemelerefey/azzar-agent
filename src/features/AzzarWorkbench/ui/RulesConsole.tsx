import { type FC } from 'react';

import { APPROVAL_LEVELS, getAgentTemplate, type ToolGrant } from '../catalog';
import { defaultRuleSet, effectiveLevel, setToolLevel } from '../domain/rules';
import type { RuleRole, RuleSet } from '../domain/types';
import { levelKey } from './AgentDetails';
import { useAzzarT } from './i18n';
import { Btn, Card, Field, Marker, Notice, styles } from './kit';

const Check: FC<{ checked: boolean; label: string; onChange: (v: boolean) => void }> = ({
  checked,
  label,
  onChange,
}) => (
  <label style={{ alignItems: 'center', display: 'flex', fontSize: 13, gap: 6 }}>
    <input checked={checked} type="checkbox" onChange={(e) => onChange(e.target.checked)} />
    {label}
  </label>
);

/**
 * Rules for one department (or the personal rules in Individual mode). Changes apply from the
 * next run. The model lock and run location are stored and shown only, and say so.
 */
export const RulesConsole: FC<{
  managerIds: string[];
  onChange: (rules: RuleSet) => void;
  rules: RuleSet;
  showIsolationNote?: boolean;
}> = ({ managerIds, onChange, rules, showIsolationNote }) => {
  const { bi, t } = useAzzarT();
  const tools: ToolGrant[] = managerIds.flatMap((id) => getAgentTemplate(id)?.tools ?? []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={styles.muted}>{t('rulesSubtitle')}</p>

      <Card>
        <h2 style={styles.h2}>{t('rulesToolLevels')}</h2>
        {tools.length === 0 && <p style={styles.muted}>{t('comingSoon')}</p>}
        {tools.map((tool) => (
          <div key={tool.id} style={{ ...styles.row, justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13 }}>
              {bi(tool.label)} <code style={{ fontSize: 11, opacity: 0.6 }}>{tool.id}</code>
            </span>
            <select
              style={{ ...styles.field, maxWidth: 200 }}
              value={effectiveLevel(rules, tool, 'manager')}
              onChange={(e) =>
                onChange(
                  setToolLevel(
                    rules,
                    tool.id,
                    e.target.value as (typeof APPROVAL_LEVELS)[number],
                    tool.defaultLevel,
                  ),
                )
              }
            >
              {APPROVAL_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {t(levelKey(l))}
                  {l === tool.defaultLevel ? ` (${t('default')})` : ''}
                </option>
              ))}
            </select>
          </div>
        ))}
      </Card>

      <Card>
        <h2 style={styles.h2}>{t('rulesRoleAccess')}</h2>
        {(['manager', 'specialist'] as RuleRole[]).map((role) => (
          <div key={role} style={styles.row}>
            <strong style={{ fontSize: 13, minWidth: 90 }}>
              {t(role === 'manager' ? 'roleManager' : 'roleSpecialist')}
            </strong>
            {(['read', 'write', 'send'] as const).map((k) => (
              <Check
                checked={rules.roleAccess[role][k]}
                key={k}
                label={t(
                  k === 'read' ? 'accessRead' : k === 'write' ? 'accessWrite' : 'accessSend',
                )}
                onChange={(v) =>
                  onChange({
                    ...rules,
                    roleAccess: {
                      ...rules.roleAccess,
                      [role]: { ...rules.roleAccess[role], [k]: v },
                    },
                  })
                }
              />
            ))}
          </div>
        ))}
      </Card>

      <Card>
        <div style={{ ...styles.row, justifyContent: 'space-between' }}>
          <h2 style={styles.h2}>{t('rulesRunLocation')}</h2>
          <Marker label="uiOnly" />
        </div>
        <select
          style={{ ...styles.field, maxWidth: 260 }}
          value={rules.runLocation}
          onChange={(e) =>
            onChange({ ...rules, runLocation: e.target.value as RuleSet['runLocation'] })
          }
        >
          <option value="employee-device">{t('runEmployeeDevice')}</option>
          <option value="company-server">{t('runCompanyServer')}</option>
        </select>
        <p style={styles.muted}>{t('runLocationNote')}</p>
      </Card>

      <Card>
        <div style={{ ...styles.row, justifyContent: 'space-between' }}>
          <h2 style={styles.h2}>{t('rulesModel')}</h2>
          <Marker label="uiOnly" />
        </div>
        <Check
          checked={rules.model.lock}
          label={t('rulesModelLock')}
          onChange={(v) => onChange({ ...rules, model: { ...rules.model, lock: v } })}
        />
        <Field label={t('rulesModelId')}>
          <input
            disabled={!rules.model.lock}
            style={styles.field}
            value={rules.model.modelId ?? ''}
            onChange={(e) =>
              onChange({ ...rules, model: { ...rules.model, modelId: e.target.value || null } })
            }
          />
        </Field>
        <p style={styles.muted}>{t('rulesModelNote')}</p>
      </Card>

      <Card>
        <h2 style={styles.h2}>{t('rulesMemory')}</h2>
        <Check
          checked={rules.memory.digestToDepartment}
          label={t('rulesDigestDept')}
          onChange={(v) =>
            onChange({ ...rules, memory: { ...rules.memory, digestToDepartment: v } })
          }
        />
        <Check
          checked={rules.memory.digestToGlobal}
          label={t('rulesDigestGlobal')}
          onChange={(v) => onChange({ ...rules, memory: { ...rules.memory, digestToGlobal: v } })}
        />
        <h2 style={styles.h2}>{t('rulesInherit')}</h2>
        <div style={styles.row}>
          {(['policies', 'tone', 'sources'] as const).map((k) => (
            <Check
              checked={rules.inherit[k]}
              key={k}
              label={t(
                k === 'policies'
                  ? 'inheritPolicies'
                  : k === 'tone'
                    ? 'inheritTone'
                    : 'inheritSources',
              )}
              onChange={(v) => onChange({ ...rules, inherit: { ...rules.inherit, [k]: v } })}
            />
          ))}
        </div>
      </Card>

      {showIsolationNote && (
        <Notice>
          <Marker label="groupingNotInfra" /> {t('rulesIsolation')}
        </Notice>
      )}
      <div>
        <Btn onClick={() => onChange(defaultRuleSet())}>{t('rulesReset')}</Btn>
      </div>
    </div>
  );
};
