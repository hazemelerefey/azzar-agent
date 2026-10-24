import { RefObject } from 'react';
import { AudioProps } from "../AudioPlayer";
export interface StreamAudioPlayerResponse extends AudioProps {
    arrayBuffers: ArrayBuffer[];
    download: () => void;
    load: (arrayBuffer: ArrayBuffer) => void;
    ref: RefObject<HTMLAudioElement>;
    reset: () => void;
    url: string;
}
export declare const useStreamAudioPlayer: () => StreamAudioPlayerResponse;
