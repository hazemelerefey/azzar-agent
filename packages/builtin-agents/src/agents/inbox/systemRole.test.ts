import { describe, expect, it } from 'vitest';

import {
  BUILTIN_AGENTS,
  createProjectCoordinatorAgentConfig,
  getAgentRuntimeConfig,
} from '../../index';
import { INBOX } from './index';
import { createSystemRole } from './systemRole';

describe('inbox createSystemRole', () => {
  it('defaults to Azzar when the assistant has no custom name', () => {
    expect(createSystemRole()).toContain('You are Azzar, an AI Agent');
  });

  it('contains full AZZAR identity and origins when default', () => {
    const role = createSystemRole();
    expect(role).toContain('AZZAR (أذّار)');
    expect(role).toContain('VO for Technology');
    expect(role).toContain('https://www.vo.technology/en');
    expect(role).toContain('Eng. Hazem Elerefy, AI Engineer at VO for Technology');
    expect(role).toContain('github.com/hazemelerefey');
    expect(role).not.toContain('https://hazemelerefy.tech');
    expect(role).not.toContain('under the leadership of');
    expect(role).toContain('Egyptian Arabic');
    expect(role).toContain('Do not refer to yourself as "CAO" directly to the user');
    expect(role).toContain('Never write your Arabic name as "عزار"');
    expect(role).toContain('Marketing Department (Status: Available)');
    expect(role).toContain('Other 7 Enterprise Departments (Status: Coming soon)');
  });

  it('preserves AZZAR_IDENTITY_BLOCK in INBOX.runtime even when storedSystemRole is customized or legacy', () => {
    const customRuntime = INBOX.runtime({
      plugins: [],
      storedSystemRole: 'Focus on Egyptian B2B SaaS growth.',
    });
    expect(customRuntime.systemRole).toContain('AZZAR (أذّار)');
    expect(customRuntime.systemRole).toContain('VO for Technology (https://www.vo.technology/en)');
    expect(customRuntime.systemRole).toContain('Focus on Egyptian B2B SaaS growth.');

    const legacyRuntime = INBOX.runtime({
      plugins: [],
      storedSystemRole: 'You are Azzar, an AI Agent will help users.',
    });
    expect(legacyRuntime.systemRole).toContain('AZZAR (أذّار)');
    expect(legacyRuntime.systemRole).toContain(
      'Eng. Hazem Elerefy, AI Engineer at VO for Technology',
    );
  });

  it('introduces the user-given name instead of the product default', () => {
    const result = createSystemRole(undefined, { name: '芙莉莲' });

    expect(result).toContain('You are 芙莉莲, an AI Agent');
    expect(result).not.toContain('You are Azzar');
    expect(result).not.toContain('AZZAR (أذّار)');
  });

  it('carries the role title alongside the name', () => {
    expect(createSystemRole(undefined, { name: '芙莉莲', title: '魔法使' })).toContain(
      'You are 芙莉莲 (魔法使), an AI Agent',
    );
  });

  it('uses the title as identity when there is no name', () => {
    expect(createSystemRole(undefined, { title: 'Health Assistant' })).toContain(
      'You are Azzar (Health Assistant), an AI Agent',
    );
  });

  it('treats blank identity values as absent', () => {
    expect(createSystemRole(undefined, { name: '  ', title: '' })).toContain(
      'You are Azzar, an AI Agent',
    );
  });

  it('keeps the preferred-language suffix', () => {
    expect(createSystemRole('zh-CN', { name: '芙莉莲' })).toContain(
      'Preferred reply language: zh-CN',
    );
  });

  it('verifies all 15 builtin agents carry canonical AZZAR, VO for Technology, and Eng. Hazem Elerefy attribution', () => {
    const slugs = Object.keys(BUILTIN_AGENTS);
    expect(slugs).toHaveLength(14);

    for (const slug of slugs) {
      const runtime = getAgentRuntimeConfig(slug as keyof typeof BUILTIN_AGENTS, {
        groupSupervisorContext: { groupTitle: 'Growth Team' },
        plugins: [],
      });
      expect(runtime?.systemRole, `slug ${slug}`).toBeTruthy();
      expect(runtime?.systemRole, `slug ${slug} AZZAR`).toContain('AZZAR');
      expect(runtime?.systemRole, `slug ${slug} Arabic أذّار`).toContain('أذّار');
      expect(runtime?.systemRole, `slug ${slug} VO link`).toContain(
        'https://www.vo.technology/en',
      );
      expect(runtime?.systemRole, `slug ${slug} Hazem attribution`).toContain(
        'Eng. Hazem Elerefy, AI Engineer at VO for Technology',
      );
      expect(runtime?.systemRole, `slug ${slug} GitHub link`).toContain(
        'github.com/hazemelerefey',
      );
    }

    const coordinator = createProjectCoordinatorAgentConfig({
      identifier: 'proj-coord-1',
      name: 'Growth',
    });
    expect(coordinator.systemRole).toContain('AZZAR');
    expect(coordinator.systemRole).toContain('أذّار');
    expect(coordinator.systemRole).toContain('https://www.vo.technology/en');
    expect(coordinator.systemRole).toContain(
      'Eng. Hazem Elerefy, AI Engineer at VO for Technology',
    );
    expect(coordinator.systemRole).toContain('github.com/hazemelerefey');
  });
});
