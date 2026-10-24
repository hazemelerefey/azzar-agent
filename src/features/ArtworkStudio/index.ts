export { default as ArtworkStudioContent, type ArtworkStudioContentProps } from './Content';
export { AZZAR_STYLE_REFERENCE_IMAGE_URLS, styleReferencesForArtworkStyle } from './styleReferences';
// Re-exported so a surface can render the studio without taking a direct
// dependency on `@azzar/prompts`.
export type { AgentArtworkStyle } from '@azzar/prompts';
