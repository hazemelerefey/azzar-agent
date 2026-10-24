import { type SsmlOptions } from '../utils/genSSML';
export interface EdgeSpeechPayload {
    /**
     * @title 语音合成的文本
     */
    input: string;
    /**
     * @title SSML 语音合成的配置
     */
    options: Pick<SsmlOptions, 'voice'>;
}
export interface CreateEdgeSpeechCompletionOptions {
    payload: EdgeSpeechPayload;
}
export declare const createEdgeSpeech: ({ payload }: CreateEdgeSpeechCompletionOptions, { proxyUrl, token }?: {
    proxyUrl?: string | undefined;
    token?: string | undefined;
}) => Promise<Response>;
