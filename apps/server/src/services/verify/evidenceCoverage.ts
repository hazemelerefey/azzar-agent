import { readRequiredEvidence as readSpecs } from '@azzar/const/verify';
import type { RequiredEvidenceSpec } from '@azzar/types';

// The coverage rule lives in `@azzar/const/verify` so the CLI reports the
// same gaps the verifier's structural gate enforces.
export { coverageGaps, runEvidenceGaps } from '@azzar/const/verify';

export const readRequiredEvidence = (
  config: Record<string, unknown> | undefined | null,
): RequiredEvidenceSpec[] | undefined => readSpecs<RequiredEvidenceSpec>(config);
