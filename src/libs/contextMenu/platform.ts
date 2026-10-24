export type AzzarEnv = NonNullable<Window['azzarEnv']>;

export const getAzzarEnv = (): AzzarEnv | undefined => window.azzarEnv;

export const isDarwinDesktop = (): boolean => getAzzarEnv()?.platform === 'darwin';
