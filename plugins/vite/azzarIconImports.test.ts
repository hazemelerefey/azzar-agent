import { build, type Plugin } from 'vite';
import { describe, expect, it } from 'vitest';

import { azzarIconImports } from './azzarIconImports';

const ENTRY_ID = '\0azzar-icon-imports-fixture.mjs';

const fixturePlugin: Plugin = {
  name: 'azzar-icon-imports-fixture',
  load(id) {
    if (id !== ENTRY_ID) return;

    return `
      import { getAzzarIconCDN, MCP } from '@azzar/icons';
      export { getAzzarIconCDN, MCP };
    `;
  },
  resolveId(id) {
    if (id === 'virtual:azzar-icon-imports-fixture') return ENTRY_ID;
  },
};

describe('azzarIconImports', () => {
  it('keeps icon barrel dependencies out of transformed .mjs modules', async () => {
    const result = await build({
      build: {
        minify: false,
        rolldownOptions: {
          external: /^@azzar\/icons\/es\//,
          input: 'virtual:azzar-icon-imports-fixture',
        },
        write: false,
      },
      configFile: false,
      logLevel: 'silent',
      plugins: [fixturePlugin, ...azzarIconImports()],
    });

    const outputs = Array.isArray(result) ? result : [result];
    const code = outputs
      .flatMap(({ output }) => output)
      .filter((item) => item.type === 'chunk')
      .map((item) => item.code)
      .join('\n');

    expect(code).toContain('@azzar/icons/es/MCP/index.js');
    expect(code).toContain('@azzar/icons/es/features/getAzzarIconCDN/index.js');
    expect(code).not.toMatch(/from ["']@azzar\/icons["']/);
  });
});
