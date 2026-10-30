import { useStore } from 'zustand';

import { createWorkbenchStore, type WorkbenchState } from '../domain/store';

/**
 * The one persisted workbench store for the app. State lives in this browser (localStorage) in
 * this release: there are no database writes. `toAgentCreateInput` is the bridge for later.
 */
export const workbenchStore = createWorkbenchStore();

export const useWorkbench = <T>(selector: (s: WorkbenchState) => T): T =>
  useStore(workbenchStore, selector);
