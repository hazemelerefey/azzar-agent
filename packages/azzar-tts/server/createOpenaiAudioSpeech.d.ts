import OpenAI from 'openai';
import type { OpenAITTSPayload } from '../core/OpenAITTS';
export interface CreateOpenaiAudioSpeechCompletionOptions {
    openai: OpenAI;
    payload: OpenAITTSPayload;
}
export declare const createOpenaiAudioSpeech: ({ payload, openai, }: CreateOpenaiAudioSpeechCompletionOptions) => Promise<Response>;
