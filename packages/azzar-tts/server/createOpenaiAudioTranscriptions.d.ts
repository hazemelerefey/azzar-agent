import OpenAI from 'openai';
import type { OpenAISTTPayload } from "../core/OpenAISTT";
export interface CreateOpenaiAudioTranscriptionsOptions {
    openai: OpenAI;
    payload: OpenAISTTPayload;
}
export declare const createOpenaiAudioTranscriptions: ({ payload, openai, }: CreateOpenaiAudioTranscriptionsOptions) => Promise<OpenAI.Audio.Transcriptions.Transcription & {
    _request_id?: string | null | undefined;
}>;
