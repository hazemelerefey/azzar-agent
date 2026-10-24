/// <reference types="react" />
import { type SsmlOptions } from "../../core/utils/genSSML";
export interface SpeechSynthesOptions extends Pick<SsmlOptions, 'voice' | 'rate' | 'pitch'> {
    onStart?: () => void;
    onStop?: () => void;
}
export declare const useSpeechSynthes: (defaultText: string, { voice, rate, pitch, ...options }: SpeechSynthesOptions) => {
    isLoading: boolean;
    setText: import("react").Dispatch<import("react").SetStateAction<string>>;
    start: () => void;
    stop: () => void;
};
