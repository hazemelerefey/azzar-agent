export interface SpeechRecognitionCoreOptions {
    onRecognitionError?: (error: any) => void;
    onRecognitionFinish?: (value: string) => void;
    onRecognitionStart?: () => void;
    onRecognitionStop?: () => void;
    onTextChange?: (value: string) => void;
}
export declare const useSpeechRecognitionCore: (locale: string, { onTextChange, onRecognitionStart, onRecognitionFinish, onRecognitionStop, onRecognitionError, }?: SpeechRecognitionCoreOptions) => {
    isLoading: boolean;
    start: () => void;
    stop: () => void;
    text: string;
};
