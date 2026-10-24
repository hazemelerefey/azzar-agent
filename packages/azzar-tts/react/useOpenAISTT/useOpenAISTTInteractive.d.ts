import { type OpenAISTTRecorderOptions } from './useOpenAISTTRecorder';
export declare const useOpenAISTTInteractive: (locale: string, { onBlobAvailable, onTextChange, onSuccess, onError, onFinished, onStart, onStop, options, onRecognitionStop, onRecognitionStart, onRecognitionError, onRecognitionFinish, ...restConfig }?: OpenAISTTRecorderOptions) => {
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
