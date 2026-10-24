import type { WatchOptions } from 'vite';

const IGNORED_DIRECTORY_NAMES = new Set([
  '.agent-tracing',
  '.agents',
  '.changeset',
  '.claude',
  '.codex',
  '.conductor',
  '.cursor',
  '.devcontainer',
  '.gemini',
  '.git',
  '.githooks',
  '.github',
  '.husky',
  '.local-config',
  '.next',
  '.nyc_output',
  '.records',
  '.turbo',
  '.vscode',
  '__mocks__',
  '__snapshots__',
  '__tests__',
  'changelog',
  'coverage',
  'devtools',
  'dist',
  'docker-compose',
  'e2e',
  'fixtures',
  'node_modules',
  'patches',
  'pipeline',
  'scripts',
  'test',
  'tests',
]);

/** Root-only repository areas; matching these names at arbitrary depth can hide browser routes. */
const IGNORED_ROOT_DIRECTORY_PATHS = [
  ['apps', 'cli'],
  ['apps', 'desktop'],
  ['doc'],
  ['docs'],
  ['packages', 'database'],
  ['public', '_spa'],
  ['public', '_spa-auth'],
  ['public', '_spa-share'],
  ['public', '_spa-workbench'],
  ['public', '.well-known'],
  ['public', 'acceptance'],
  ['public', 'app-icons'],
  ['public', 'avatars'],
  ['public', 'canvas-runtime'],
  ['public', 'emoji-assets'],
  ['public', 'og'],
  ['public', 'screenshots'],
  ['public', 'sounds'],
  ['public', 'static'],
  ['public', 'videos'],
  ['src', 'app'],
  ['src', 'server'],
];

const TEST_FILE_PATTERN = /\.(?:spec|test)\.[cm]?[jt]sx?$/;

const normalizeWatchedPath = (filePath: string) =>
  filePath.replaceAll('\\', '/').replace(/\/+$/, '');

const relativeToRoot = (filePath: string, root: string) => {
  const normFile = normalizeWatchedPath(filePath);
  const normRoot = normalizeWatchedPath(root);

  if (normFile.toLowerCase() === normRoot.toLowerCase()) return '';

  const rootPrefix = `${normRoot}/`;
  if (normFile.toLowerCase().startsWith(rootPrefix.toLowerCase())) {
    return normFile.slice(rootPrefix.length);
  }
};

const isViteWatchRelativePathIgnored = (relativePath: string) => {
  const segments = relativePath.split('/').filter(Boolean);
  const fileName = segments.at(-1) ?? '';

  if (fileName === '.env' || fileName.startsWith('.env.') || TEST_FILE_PATTERN.test(fileName)) {
    return true;
  }

  if (
    segments.some(
      (segment) =>
        IGNORED_DIRECTORY_NAMES.has(segment) ||
        IGNORED_DIRECTORY_NAMES.has(segment.toLowerCase()),
    )
  ) {
    return true;
  }

  return IGNORED_ROOT_DIRECTORY_PATHS.some((directoryPath) =>
    directoryPath.every(
      (segment, index) => segments[index]?.toLowerCase() === segment.toLowerCase(),
    ),
  );
};

/**
 * Keep the SPA watcher focused on browser runtime sources. Vite otherwise watches the entire
 * monorepo recursively, including independent applications and repository-only tooling.
 */
export const createViteWatchOptions = (sourceRoots: string[]) => {
  const normalizedRoots = sourceRoots.map(normalizeWatchedPath);

  return {
    ignored: (filePath: string) => {
      const normalizedPath = normalizeWatchedPath(filePath);

      return normalizedRoots.some((root) => {
        const relativePath = relativeToRoot(normalizedPath, root);

        return relativePath === undefined ? false : isViteWatchRelativePathIgnored(relativePath);
      });
    },
  } satisfies WatchOptions;
};
