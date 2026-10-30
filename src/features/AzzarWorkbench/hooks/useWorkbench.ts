import { useEffect } from 'react';
import { useStore } from 'zustand';

import { createWorkbenchStore, type WorkbenchState } from '../domain/store';

/**
 * The Workbench store. Departments, projects, My Agents installs/assignments, missions,
 * and admin role state are persisted in PostgreSQL via tRPC (`missionService`).
 */
export const workbenchStore = createWorkbenchStore();

let hydratedOnce = false;

export const useWorkbench = <T>(selector: (s: WorkbenchState) => T): T => {
  useEffect(() => {
    if (!hydratedOnce && process.env.NODE_ENV !== 'test') {
      hydratedOnce = true;
      void workbenchStore.getState().hydrateFromServer();
    }
  }, []);
  return useStore(workbenchStore, selector);
};
