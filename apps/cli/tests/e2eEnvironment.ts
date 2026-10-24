import path from 'node:path';

/** Live tests must opt in to writes and select their own account home and server. */
export function validateE2EEnvironment(env: NodeJS.ProcessEnv) {
  if (env.AZZAR_E2E_ALLOW_WRITES !== '1') {
    throw new Error('Live E2E writes real data. Set AZZAR_E2E_ALLOW_WRITES=1 to opt in.');
  }

  const home = env.AZZAR_CLI_HOME?.trim();
  if (!home || path.basename(path.normalize(home)) === '.azzar') {
    throw new Error('Set AZZAR_CLI_HOME to a dedicated test account directory, not .azzar.');
  }

  if (!env.AZZAR_SERVER) throw new Error('Set AZZAR_SERVER explicitly for live E2E.');
  const server = new URL(env.AZZAR_SERVER);
  if (!['http:', 'https:'].includes(server.protocol) || server.username || server.password) {
    throw new Error('AZZAR_SERVER must be an HTTP(S) URL without credentials.');
  }
}
