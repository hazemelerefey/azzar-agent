import { type SpeechRecognitionCoreOptions } from './useSpeechRecognitionCore';
export interface SpeechRecognitionRecorderOptions extends SpeechRecognitionCoreOptions {
    onBlobAvailable?: (blob: Blob) => void;
    onStart?: () => void;
    onStop?: () => void;
}
export declare const useSpeechRecognitionAutoStop: (locale: string, { onStart, onStop, onBlobAvailable, onRecognitionFinish, ...rest }?: SpeechRecognitionRecorderOptions) => {
    blob: Blob | undefined;
    formattedTime: string;
    isLoading: boolean;
    isRecording: boolean;
    response: Response;
    start: () => void;
    stop: () => void;
    text: string;
    time: number;
    url: string | undefined;
};
