import { describe, expect, it } from 'vitest';

import {
  getCreateProjectInput,
  getProjectFieldSuggestions,
  isProjectIdentifierValid,
  isProjectSlugValid,
} from './createProjectForm';

describe('createProjectForm', () => {
  it('derives a valid identifier and slug from the project name', () => {
    expect(getProjectFieldSuggestions('AZZAR')).toEqual({
      identifier: 'AZZAR',
      slug: 'azzar-hub',
    });
    expect(getProjectFieldSuggestions('AZZAR Mobile')).toEqual({
      identifier: 'LHM',
      slug: 'azzar-hub-mobile',
    });
    expect(getProjectFieldSuggestions('用户记忆')).toEqual({
      identifier: 'YHJY',
      slug: 'yong-hu-ji-yi',
    });
  });

  it('returns empty suggestions when the project name is empty', () => {
    expect(getProjectFieldSuggestions('  ')).toEqual({ identifier: '', slug: '' });
  });

  it('validates the identifier format shown by the form', () => {
    expect(isProjectIdentifierValid('AZZAR')).toBe(true);
    expect(isProjectIdentifierValid('LH')).toBe(false);
    expect(isProjectIdentifierValid('1AZZAR')).toBe(false);
  });

  it('normalizes and includes a user-provided slug', () => {
    expect(
      getCreateProjectInput({
        identifier: ' azzar ',
        name: '  AZZAR Project  ',
        slug: '  AZZAR-Project  ',
      }),
    ).toEqual({
      identifier: 'AZZAR',
      name: 'AZZAR Project',
      slug: 'azzar-project',
    });
  });

  it('omits an empty slug so the backend can generate one', () => {
    expect(
      getCreateProjectInput({ identifier: 'AZZAR', name: 'AZZAR Project', slug: '  ' }),
    ).toEqual({ identifier: 'AZZAR', name: 'AZZAR Project' });
  });

  it('rejects malformed slugs', () => {
    expect(isProjectSlugValid('two--hyphens')).toBe(false);
    expect(isProjectSlugValid('contains spaces')).toBe(false);
    expect(
      getCreateProjectInput({ identifier: 'AZZAR', name: 'AZZAR Project', slug: '-invalid' }),
    ).toBeNull();
  });
});
