import type { ToolManifest, ToolManifestType } from './manifest';
import type { CustomPluginParams } from './plugin';
import type { AzzarToolType } from './tool';

export interface AzzarTool {
  customParams?: CustomPluginParams | null;
  identifier: string;
  manifest?: ToolManifest | null;
  /**
   * use for runtime
   */
  runtimeType?: ToolManifestType;
  settings?: any;
  // TODO: remove type and then make it required
  source?: AzzarToolType;
  /**
   * need to be replaced with source
   * @deprecated
   */
  type: AzzarToolType;
}

export type AzzarToolRenderType = ToolManifestType;

export * from './builtin';
export * from './crawler';
export * from './error';
export * from './intervention';
export * from './manifest';
export * from './plugin';
export * from './search';
export * from './tool';
