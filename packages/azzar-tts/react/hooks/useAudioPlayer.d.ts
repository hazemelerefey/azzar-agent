import { RefObject } from 'react';
import { AudioProps } from "../AudioPlayer";
export interface AudioPlayerResponse extends AudioProps {
    arrayBuffers: ArrayBuffer[];
    download: () => void;
    isLoading?: boolean;
    ref: RefObject<HTMLAudioElement>;
    reset: () => void;
    url: string;
}
export interface AudioPlayerOptions {
    src?: string;
    type?: string;
}
export declare const useAudioPlayer: ({ src, type, }?: AudioPlayerOptions) => AudioPlayerResponse;
