import { MARKETING_COMPETITOR_SCRIPT, MARKETING_LAUNCH_SCRIPT } from './scripts/marketing';
import type { MissionScript } from './types';

/**
 * Script registry. A department can run missions only if it has scripts here. Phasing in another
 * department means adding its scripts to this list, with no change to the engine or the pages.
 */
export const MISSION_SCRIPTS: MissionScript[] = [
  MARKETING_LAUNCH_SCRIPT,
  MARKETING_COMPETITOR_SCRIPT,
];

const byId = new Map(MISSION_SCRIPTS.map((s) => [s.id, s]));

export const getScript = (id: string): MissionScript | undefined => byId.get(id);

export const scriptsForDepartment = (departmentId: string): MissionScript[] =>
  MISSION_SCRIPTS.filter((s) => s.departmentId === departmentId);
