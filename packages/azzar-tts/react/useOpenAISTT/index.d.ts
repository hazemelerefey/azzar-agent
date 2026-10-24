import { OpenAISTTRecorderOptions } from './useOpenAISTTRecorder';
export interface OpenAISTTOptions extends OpenAISTTRecorderOptions {
    autoStop?: boolean;
}
export declare const useOpenAISTT: (locale: string, { autoStop, ...rest }?: OpenAISTTOptions) => {
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
