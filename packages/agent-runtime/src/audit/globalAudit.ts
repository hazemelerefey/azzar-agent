import { type GlobalInterventionAuditConfig } from '@azzar/types';

import { createSecurityBlacklistGlobalAudit } from './createSecurityBlacklistAudit';

export const createDefaultGlobalAudits = (): GlobalInterventionAuditConfig[] => [
  createSecurityBlacklistGlobalAudit(),
  createSecurityBlacklistGlobalAudit('required'),
];
