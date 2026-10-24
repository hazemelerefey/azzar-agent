import { RefObject } from 'react';
export declare const useAudioVisualizer: (audioRef: RefObject<HTMLAudioElement>, { count, }: {
    count: number;
    humanVoice?: boolean | undefined;
}) => number[];
