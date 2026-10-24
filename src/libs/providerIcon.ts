/* eslint-disable no-restricted-imports -- the lazy wrapper in @/components/AzzarIcons is the only importer */
import {
  ProviderCombine as AzzarProviderCombine,
  ProviderIcon as AzzarProviderIcon,
  providerMappings,
  Unsloth,
} from '@azzar/icons';
/* eslint-enable no-restricted-imports */

/**
 * @azzar/icons 5.18 exports Unsloth but omits its provider mapping. Register
 * the official artwork until the library includes it, preserving an upstream
 * mapping when present. Keep this alongside provider icon consumers so the
 * complete mapping table stays outside the SPA's initial dependency graph.
 */
if (
  !providerMappings.some(({ keywords }) => keywords.some((key) => key.toLowerCase() === 'unsloth'))
) {
  providerMappings.push({ Icon: Unsloth, keywords: ['unsloth'] });
}

// Do not turn these back into `export { ... }` re-exports: with rolldown's
// strictExecutionOrder (rolldown 1.2.12) the icon modules' init wrappers are
// then never called in production chunks, both exports stay undefined and the
// lazy loaders in @/components/AzzarIcons crash with React #306.
export const ProviderIcon = AzzarProviderIcon;
export const ProviderCombine = AzzarProviderCombine;
