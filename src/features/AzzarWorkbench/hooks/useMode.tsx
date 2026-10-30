import { type FC, type ReactNode } from 'react';
import { Navigate } from 'react-router';

import { useWorkbench } from './useWorkbench';

export const useMode = () => useWorkbench((s) => s.mode ?? 'company');

/**
 * Company-only pages. In Individual mode they redirect home. Company data is kept, never deleted.
 */
export const CompanyOnly: FC<{ children: ReactNode }> = ({ children }) => {
  const mode = useMode();
  if (mode !== 'company') return <Navigate replace to="/" />;
  return <>{children}</>;
};

/** Any page that needs a chosen mode. Defaults to company mode. */
export const NeedsMode: FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
