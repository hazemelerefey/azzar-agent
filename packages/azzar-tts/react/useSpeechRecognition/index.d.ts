import { SpeechRecognitionRecorderOptions } from './useSpeechRecognitionAutoStop';
export interface SpeechRecognitionOptions extends SpeechRecognitionRecorderOptions {
    autoStop?: boolean;
}
export declare const useSpeechRecognition: (locale: string, { autoStop, ...rest }?: SpeechRecognitionOptions) => {
    blob: Blob | undefined;
    formattedTime: string;
    isLoading: boolean;
    isRecording: boolean;
    response: Response;
    start: () => void;
    stop: () => void;
    text: string | undefined;
    time: number;
    url: string | undefined;
};
