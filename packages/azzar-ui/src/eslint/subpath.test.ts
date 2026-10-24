// @vitest-environment node

import { Linter } from 'eslint';

import { subpathRules } from './index';

const config = {
  ...subpathRules,
  languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
} as Linter.Config;

const fix = (code: string) => new Linter({ configType: 'flat' }).verifyAndFix(code, config);

const RULE = '@azzar/ui/no-base-ui-subpath';

describe('no-base-ui-subpath', () => {
  it.each([
    ["import { Button } from '@azzar/ui';", "import { Button } from '@azzar/ui';"],
    [
      "import { Form } from '@azzar/ui/form';",
      "import { Form } from '@azzar/ui/form';",
    ],
    [
      "import { ProTable } from '@azzar/ui/pro-table';",
      "import { ProTable } from '@azzar/ui/pro-table';",
    ],
    ["export { Tag } from '@azzar/ui';", "export { Tag } from '@azzar/ui';"],
    ["export * from '@azzar/ui';", "export * from '@azzar/ui';"],
    ["const m = import('@azzar/ui');", "const m = import('@azzar/ui');"],
  ])('rewrites %s', (code, output) => {
    expect(new Linter({ configType: 'flat' }).verify(code, config)).toEqual([
      expect.objectContaining({ ruleId: RULE, severity: 2 }),
    ]);
    expect(fix(code)).toMatchObject({ fixed: true, messages: [], output });
  });

  it.each([
    "import { Button } from '@azzar/ui';",
    "import { Form } from '@azzar/ui/form';",
    "import { Menu } from '@base-ui/react/menu';",
    "import { Thing } from '@azzar/ui-extra';",
  ])('allows %s', (code) => {
    expect(new Linter({ configType: 'flat' }).verify(code, config)).toEqual([]);
  });
});
