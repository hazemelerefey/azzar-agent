import { describe, expect, it } from 'vitest';

import { resolveNavPanelKey } from './routeKey';

describe('resolveNavPanelKey', () => {
  it.each([
    ['/', null, 'home'],
    ['/azzar-team', 'azzar-team', 'home'],
    ['/tasks', null, 'home'],
    ['/azzar-team/task/task-1', 'azzar-team', 'home'],
    ['/agent/agent-1', null, 'agent'],
    ['/azzar-team/agent/agent-1', 'azzar-team', 'agent'],
    ['/agent/agent-1/docs', null, 'agent-docs'],
    ['/agent/agent-1/docs/docs-1', null, 'agent-docs'],
    ['/azzar-team/agent/agent-1/docs/docs-1', 'azzar-team', 'agent-docs'],
    ['/group/group-1', null, 'group'],
    ['/settings/profile', null, 'settings'],
    ['/azzar-team/settings/general', 'azzar-team', 'workspace-settings'],
    ['/azzar-team/community', 'azzar-team', 'discover'],
    ['/azzar-team/resource', 'azzar-team', 'resource'],
    ['/azzar-team/resource/library', 'azzar-team', 'resourceLibrary'],
    ['/azzar-team/memory', 'azzar-team', 'memory'],
    ['/azzar-team/eval', 'azzar-team', 'eval'],
    ['/azzar-team/eval/bench/benchmark-1', 'azzar-team', 'evalBench'],
    ['/azzar-team/page/page-1', 'azzar-team', 'page'],
    ['/project/project-1', null, 'project'],
    ['/azzar-team/project/project-1/library/kb-1', 'azzar-team', 'project'],
    ['/azzar-team/image', 'azzar-team', 'image'],
    ['/azzar-team/video', 'azzar-team', 'video'],
  ])('maps %s to %s', (pathname, activeWorkspaceSlug, expected) => {
    expect(resolveNavPanelKey(pathname, activeWorkspaceSlug)).toBe(expected);
  });
});
