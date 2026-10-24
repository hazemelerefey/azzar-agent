import type { BuiltinSkill } from '@azzar/types';

import { filterBuiltinSkills } from '@/helpers/skillFilters';

let loading: Promise<BuiltinSkill[]> | undefined;

export const loadBuiltinSkills = async () => {
  loading ??= import('@azzar/builtin-skills').then((m) => filterBuiltinSkills(m.builtinSkills));
  try {
    return await loading;
  } catch (error) {
    loading = undefined;
    throw error;
  }
};

export const loadBuiltinSkill = async (identifier: string) =>
  (await loadBuiltinSkills()).find((skill) => skill.identifier === identifier);
