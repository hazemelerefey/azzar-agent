import type {
  AzzarSkillProviderType,
  TaskTemplateConnectorReference,
  TaskTemplateConnectorSource,
} from '@azzar/const';
import { getComposioAppByIdentifier, getAzzarSkillProviderById } from '@azzar/const';

export interface ConnectorProviderMeta {
  icon: AzzarSkillProviderType['icon'];
  identifier: string;
  label: string;
  source: TaskTemplateConnectorSource;
}

export const getProviderMeta = (
  spec: TaskTemplateConnectorReference,
): ConnectorProviderMeta | undefined => {
  if (spec.source === 'azzar') {
    const p = getAzzarSkillProviderById(spec.identifier);
    if (!p) return undefined;
    return { icon: p.icon, identifier: spec.identifier, label: p.label, source: 'azzar' };
  }
  const p = getComposioAppByIdentifier(spec.identifier);
  if (!p) return undefined;
  return { icon: p.icon, identifier: spec.identifier, label: p.label, source: 'composio' };
};

export const findNextUnconnectedSpec = (
  specs: TaskTemplateConnectorReference[] | undefined,
  isConnected: (spec: TaskTemplateConnectorReference) => boolean,
): ConnectorProviderMeta | undefined => {
  if (!specs || specs.length === 0) return undefined;
  for (const spec of specs) {
    if (isConnected(spec)) continue;
    const meta = getProviderMeta(spec);
    if (!meta) continue;
    return meta;
  }
  return undefined;
};
