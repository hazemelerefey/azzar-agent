import { createElement } from 'react';
import { type RouteObject } from 'react-router';

import { CompanyOnly, NeedsMode } from './hooks/useMode';

const page =
  (
    load: () => Promise<{ default: React.ComponentType }>,
    gate: 'company' | 'mode',
  ): RouteObject['lazy'] =>
  async () => {
    const { default: Page } = await load();
    const Gate = gate === 'company' ? CompanyOnly : NeedsMode;
    return { Component: () => createElement(Gate, null, createElement(Page)) };
  };

/**
 * Workbench routes, mounted in the main layout through `BusinessDesktopRoutesWithMainLayout`.
 * Company-only pages redirect home in Individual mode.
 */
export const AzzarWorkbenchRoutes: RouteObject[] = [
  { lazy: page(() => import('./pages/MissionsHome'), 'mode'), path: 'azzar/missions' },
  { lazy: page(() => import('./pages/MissionPage'), 'mode'), path: 'azzar/missions/:id' },
  { lazy: page(() => import('./pages/Marketplace'), 'mode'), path: 'azzar/marketplace' },
  { lazy: page(() => import('./pages/MyAgents'), 'mode'), path: 'azzar/agents' },
  { lazy: page(() => import('./pages/WorkProjects'), 'mode'), path: 'azzar/projects' },
  { lazy: page(() => import('./pages/Briefing'), 'mode'), path: 'azzar/briefing' },
  { lazy: page(() => import('./pages/Departments'), 'company'), path: 'azzar/departments' },
  { lazy: page(() => import('./pages/DepartmentHub'), 'company'), path: 'azzar/departments/:id' },
  { lazy: page(() => import('./pages/CaoTree'), 'company'), path: 'azzar/cao' },
];
