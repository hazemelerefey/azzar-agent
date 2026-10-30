import { type FC } from 'react';

import { type AgentTemplate, type ApprovalLevel, getAgentTemplate } from '../catalog';
import { type AzzarKey, useAzzarT } from './i18n';
import { BiList, Marker, styles } from './kit';

const LEVEL_KEY: Record<ApprovalLevel, AzzarKey> = {
  alone: 'levelAlone',
  forbidden: 'levelForbidden',
  report: 'levelReport',
  tap: 'levelTap',
};

export const levelKey = (l: ApprovalLevel): AzzarKey => LEVEL_KEY[l];

/** Everything a person needs to decide whether to install an agent. Used by the Marketplace card. */
export const AgentDetails: FC<{ agent: AgentTemplate }> = ({ agent }) => {
  const { bi, t } = useAzzarT();
  const specialists = (agent.specialistIds ?? [])
    .map((id) => getAgentTemplate(id))
    .filter(Boolean) as AgentTemplate[];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <strong>{t('roleLabel')}</strong>
      <p style={styles.muted}>{bi(agent.role)}</p>
      <strong>{t('doesLabel')}</strong>
      <BiList items={agent.does} />
      <strong>{t('doesNotLabel')}</strong>
      <BiList items={agent.doesNot} />
      {agent.tools.length > 0 && (
        <>
          <strong>{t('toolsLabel')}</strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {agent.tools.map((tool) => (
              <div key={tool.id} style={styles.row}>
                <span style={styles.muted}>{bi(tool.label)}</span>
                <Marker label={levelKey(tool.defaultLevel)} />
                {tool.source === 'connector' && <Marker label="needsConnector" />}
              </div>
            ))}
          </div>
          <strong>{t('canTouch')}</strong>
          <BiList items={agent.data.canTouch} />
          <strong>{t('cannotTouch')}</strong>
          <BiList items={agent.data.cannotTouch} />
        </>
      )}
      {specialists.length > 0 && (
        <>
          <strong>{t('specialistsLabel')}</strong>
          <BiList
            items={specialists.map((s) => ({
              ar: `${s.name.ar}: ${s.role.ar}`,
              en: `${s.name.en}: ${s.role.en}`,
            }))}
          />
        </>
      )}
      {agent.exampleMissions && agent.exampleMissions.length > 0 && (
        <>
          <strong>{t('examples')}</strong>
          <BiList items={agent.exampleMissions} />
        </>
      )}
      <strong>{t('modelReq')}</strong>
      <p style={styles.muted}>
        {agent.modelRequirements.toolCalling ? 'tool calling · ' : ''}
        {agent.modelRequirements.minContextTokens.toLocaleString()} tokens ·{' '}
        {agent.modelRequirements.languages.join(', ')}
        {agent.modelRequirements.notes ? ` · ${bi(agent.modelRequirements.notes)}` : ''}
      </p>
      {agent.systemRole && (
        <details>
          <summary style={{ cursor: 'pointer', fontSize: 13 }}>{t('systemRoleLabel')}</summary>
          <pre
            dir="ltr"
            style={{
              fontSize: 11,
              maxHeight: 320,
              overflow: 'auto',
              padding: 8,
              whiteSpace: 'pre-wrap',
            }}
          >
            {agent.systemRole}
          </pre>
        </details>
      )}
    </div>
  );
};
