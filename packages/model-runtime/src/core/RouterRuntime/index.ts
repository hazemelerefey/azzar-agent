import type { AzzarRuntimeAI } from '../BaseAI';

export interface RuntimeItem {
  id: string;
  models?: string[] | (() => Promise<string[]>);
  runtime: AzzarRuntimeAI;
}

export type { CreateRouterRuntimeOptions, UniformRuntime } from './createRuntime';
export { createRouterRuntime } from './createRuntime';
export type { RouteAttemptFinished, RouteAttemptResult } from './routeAttempt';
