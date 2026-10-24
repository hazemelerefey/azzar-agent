import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const packageDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(packageDir, '../..');

export default defineConfig({
  plugins: [
    {
      enforce: 'pre',
      name: 'stub-azzar-ui-motion-provider',
      resolveId(id, importer) {
        if (!importer || !importer.includes('/@azzar/ui/')) return null;
        if (/MotionProvider(?:\/index(?:\.(?:mjs|js|tsx))?)?$/.test(id))
          return path.resolve(repoRoot, 'tests/mocks/azzarUiMotionProvider.tsx');
        return null;
      },
    },
  ],
  // Resolve the root `paths` map (packages first, app src as fallback) so the
  // app-level store/services graph imported by these tests loads correctly.
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'happy-dom',
    server: {
      deps: {
        inline: [/@azzar\//],
      },
    },
  },
});
