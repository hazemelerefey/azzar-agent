import type { SWRConfiguration } from 'swr';
import { type SpeechRecognitionRecorderOptions } from "../useSpeechRecognition/useSpeechRecognitionAutoStop";
import { type OpenAISTTCoreOptions } from './useOpenAISTTCore';
export interface OpenAISTTRecorderOptions extends SpeechRecognitionRecorderOptions, SWRConfiguration, Partial<OpenAISTTCoreOptions> {
    onFinished?: SWRConfiguration['onSuccess'];
}
export declare const useOpenAISTTRecorder: ({ onBlobAvailable, onTextChange, onSuccess, onError, onFinished, onStart, onStop, options, ...restConfig }?: OpenAISTTRecorderOptions) => {
    blob: Blob | undefined;
    error: any;
    formattedTime: string;
    isLoading: boolean;
    isRecording: boolean;
    mutate: import("swr/dist/_internal").KeyedMutator<Response>;
    response: Response | undefined;
    start: () => void;
    stop: () => void;
    text: string | undefined;
    time: number;
    url: string | undefined;
};
