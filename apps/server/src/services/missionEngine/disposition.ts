import type { MissionStepResult, StepDisposition } from './types';

export class MissionDispositionManager {
  /**
   * Creates a typed step result with mandatory disposition for resume/fail/reject.
   */
  static createStep(
    kind: MissionStepResult['kind'],
    params?: {
      disposition?: StepDisposition;
      error?: string;
      nodeId?: string;
      output?: any;
    },
  ): MissionStepResult {
    let disposition: StepDisposition | undefined = params?.disposition;

    // Enforce v2.9 must-fix: step disposition mapping
    if (kind === 'resume' && !disposition) {
      disposition = 'resumed';
    } else if (kind === 'fail' && !disposition) {
      disposition = 'failed';
    } else if (kind === 'reject' && !disposition) {
      disposition = 'rejected';
    }

    return {
      disposition,
      error: params?.error,
      kind,
      nodeId: params?.nodeId,
      output: params?.output,
    };
  }

  /**
   * The recorded-path reconciliation rule (v2.9 must-fix):
   * Validates that the mutated mission's consumed approval set exactly equals
   * the returned consumed approval IDs before the engine returns.
   * Throws Error if there is any mismatch.
   */
  static reconcileRecordedPath(
    mutatedConsumedSet: Iterable<string>,
    returnedConsumedIds: Iterable<string>,
  ): void {
    const mutated = new Set(mutatedConsumedSet);
    const returned = new Set(returnedConsumedIds);

    const missingInReturned = [...mutated].filter((id) => !returned.has(id));
    const missingInMutated = [...returned].filter((id) => !mutated.has(id));

    if (missingInReturned.length > 0 || missingInMutated.length > 0) {
      const details: string[] = [];
      if (missingInReturned.length > 0) {
        details.push(`consumed in state but not returned: [${missingInReturned.join(', ')}]`);
      }
      if (missingInMutated.length > 0) {
        details.push(`returned but not in consumed state: [${missingInMutated.join(', ')}]`);
      }
      throw new Error(`Recorded-path reconciliation failure: ${details.join('; ')}`);
    }
  }
}
