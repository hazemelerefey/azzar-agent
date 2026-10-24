import { type SWRConfiguration, type SWRResponse } from 'swr';
import { type AudioProps } from "../AudioPlayer";
export interface TTSResponse extends SWRConfiguration, Pick<SWRResponse, 'error' | 'mutate'> {
    audio: AudioProps & {
        arrayBuffers: ArrayBuffer[];
    };
    canStart: boolean;
    isGlobalLoading: boolean;
    isLoading: boolean;
    start: () => void;
    stop: () => void;
}
export interface TTSOptions extends SWRConfiguration {
    onFinish?: SWRConfiguration['onSuccess'];
    onStart?: () => void;
    onStop?: () => void;
}
export declare const useTTS: (key: string, text: string, fetchTTS: (segmentText: string) => Promise<ArrayBuffer>, { onError, onSuccess, onFinish, onStart, onStop, ...restSWRConfig }?: TTSOptions) => TTSResponse;
