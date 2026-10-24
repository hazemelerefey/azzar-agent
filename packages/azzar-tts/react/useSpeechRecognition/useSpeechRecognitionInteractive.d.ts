import { type SpeechRecognitionRecorderOptions } from "./useSpeechRecognitionAutoStop";
export declare const useSpeechRecognitionInteractive: (locale: string, { onBlobAvailable, onTextChange, onRecognitionFinish, onStop, onStart, ...rest }?: SpeechRecognitionRecorderOptions) => {
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
