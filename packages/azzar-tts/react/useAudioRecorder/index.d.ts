export declare const useAudioRecorder: (onBlobAvailable?: ((blob: Blob) => void) | undefined) => {
    blob: Blob | undefined;
    formattedTime: string;
    isRecording: boolean;
    mediaRecorder: MediaRecorder | undefined;
    start: () => void;
    stop: () => void;
    time: number;
    url: string | undefined;
};
