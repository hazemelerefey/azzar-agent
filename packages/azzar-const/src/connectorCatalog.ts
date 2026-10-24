import type { ComposioAppType } from './composio';
import { COMPOSIO_APP_TYPES } from './composio';
import type { AzzarSkillProviderType } from './azzarSkill';
import { AZZAR_SKILL_PROVIDERS } from './azzarSkill';

/** Feature availability used when resolving an unqualified connector identifier. */
export interface ConnectorCatalogAvailability {
  /** Whether Composio-backed connectors may be selected. */
  composio: boolean;
  /** Whether AZZAR Market connectors may be selected. */
  azzar: boolean;
}

/** A connector definition with its owning authorization system attached. */
export type ConnectorCatalogItem =
  | { provider: AzzarSkillProviderType; type: 'azzar' }
  | { serverType: ComposioAppType; type: 'composio' };

/**
 * Resolves the owner of an unqualified connector identifier.
 *
 * Use when:
 * - A generic connector surface only stores an identifier such as `github`
 * - AZZAR and Composio catalogs may contain the same identifier
 *
 * Expects:
 * - Explicitly source-qualified flows use their declared source instead
 * - AZZAR owns collisions even when its connector integration is unavailable
 *
 * Returns:
 * - The single connector definition that generic product surfaces should render
 */
export const resolveConnectorCatalogItem = (
  identifier: string,
  availability: ConnectorCatalogAvailability,
): ConnectorCatalogItem | undefined => {
  const provider = AZZAR_SKILL_PROVIDERS.find((item) => item.id === identifier);
  if (provider) return availability.azzar ? { provider, type: 'azzar' } : undefined;

  if (availability.composio) {
    const serverType = COMPOSIO_APP_TYPES.find((item) => item.identifier === identifier);
    if (serverType) return { serverType, type: 'composio' };
  }
};

/**
 * Builds the connector catalog for generic, unqualified product surfaces.
 *
 * Use when:
 * - Rendering connector discovery, settings, or agent tool pickers
 * - Every visible identifier must map to exactly one authorization system
 *
 * Expects:
 * - Explicit onboarding/provider registries continue to use their source-qualified catalogs
 *
 * Returns:
 * - AZZAR connectors first, followed by non-conflicting Composio connectors
 */
export const getConnectorCatalog = (
  availability: ConnectorCatalogAvailability,
): ConnectorCatalogItem[] => {
  const identifiers = new Set(AZZAR_SKILL_PROVIDERS.map((provider) => provider.id));
  const catalog: ConnectorCatalogItem[] = [];

  if (availability.azzar) {
    for (const provider of AZZAR_SKILL_PROVIDERS) {
      catalog.push({ provider, type: 'azzar' });
    }
  }

  if (availability.composio) {
    for (const serverType of COMPOSIO_APP_TYPES) {
      if (identifiers.has(serverType.identifier)) continue;
      identifiers.add(serverType.identifier);
      catalog.push({ serverType, type: 'composio' });
    }
  }

  return catalog;
};
