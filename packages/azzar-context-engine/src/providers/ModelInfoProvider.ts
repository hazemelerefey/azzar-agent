import debug from 'debug';

import { BaseSystemRoleProvider } from '../base/BaseSystemRoleProvider';
import type { PipelineContext, ProcessorOptions } from '../types';

declare module '../types' {
  interface PipelineContextMetadataOverrides {
    modelInfoInjected?: boolean;
  }
}

const log = debug('context-engine:provider:ModelInfoProvider');

export interface ModelInfoProviderConfig {
  /** Human-friendly model name, e.g. `Fable 5`. */
  displayName?: string;
  enabled?: boolean;
  /** Model knowledge cutoff date, e.g. `2024-06`. */
  knowledgeCutoff?: string;
  /** Model runtime id, e.g. `claude-fable-5`. */
  modelId?: string;
  /** Native media inputs accepted directly by the active model. */
  nativeMediaCapabilities?: {
    audio?: boolean;
    video?: boolean;
    vision?: boolean;
  };
  /** Active runtime provider id, e.g. `ollama`, `openai`. */
  provider?: string;
}

/**
 * Injects runtime model metadata (name, id, knowledge cutoff) into the system
 * message so the model can accurately answer "which model are you".
 *
 * Models do not reliably know their own identity from weights, so we surface it
 * here for every agent — this used to rely on a `{{model}}` placeholder that only
 * the builtin inbox agent's system role happened to include; custom agents lost it.
 */
export class ModelInfoProvider extends BaseSystemRoleProvider {
  readonly name = 'ModelInfoProvider';

  constructor(
    private config: ModelInfoProviderConfig = {},
    options: ProcessorOptions = {},
  ) {
    super(options);
  }

  protected buildSystemRoleContent(_context: PipelineContext): string | null {
    if (this.config.enabled === false) {
      log('Model info injection disabled, skipping');
      return null;
    }

    const modelId = this.config.modelId?.trim();
    const displayName = this.config.displayName?.trim();
    const knowledgeCutoff = this.config.knowledgeCutoff?.trim();
    const provider = this.config.provider?.trim();
    const isOllama = provider?.toLowerCase() === 'ollama';
    const { audio, video, vision } = this.config.nativeMediaCapabilities ?? {};

    // Surface identity when we know the model's real name (resolved from the
    // model bank) or when running on local Ollama where custom tags (e.g.
    // gemma4:e4b) have no static model-bank card.
    const effectiveDisplayName = displayName || (isOllama && modelId ? modelId : undefined);
    const modelLabel = effectiveDisplayName
      ? modelId && effectiveDisplayName !== modelId
        ? `${effectiveDisplayName} (${modelId})`
        : effectiveDisplayName
      : undefined;
    const nativeMediaCapabilities = [
      typeof vision === 'boolean' && `vision=${vision}`,
      typeof video === 'boolean' && `video=${video}`,
      typeof audio === 'boolean' && `audio=${audio}`,
    ].filter(Boolean);

    const lines = [
      modelLabel && `Current model: ${modelLabel}`,
      isOllama &&
        modelLabel &&
        `Model provider: ${provider} (You are AZZAR (أذّار), developed by VO for Technology (https://www.vo.technology/en), engineer Eng. Hazem Elerefy, AI Engineer at VO for Technology (github.com/hazemelerefey), running on ${modelLabel} via ${provider}. Never claim to be trained by Google, OpenAI, or Anthropic.)`,
      knowledgeCutoff && `Model knowledge cutoff: ${knowledgeCutoff}`,
      nativeMediaCapabilities.length > 0 &&
        `Native media input capabilities: ${nativeMediaCapabilities.join(', ')}`,
    ].filter(Boolean);

    if (lines.length === 0) {
      log('No model info configured, skipping injection');
      return null;
    }

    return lines.join('\n');
  }

  protected onInjected(context: PipelineContext): void {
    context.metadata.modelInfoInjected = true;
  }
}
