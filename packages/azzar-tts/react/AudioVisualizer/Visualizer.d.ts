import { RefObject } from 'react';
export interface VisualizerProps {
    borderRadius?: number;
    color?: string;
    count?: number;
    gap?: number;
    maxHeight?: number;
    minHeight?: number;
    width?: number;
}
declare const Visualizer: import("react").NamedExoticComponent<VisualizerProps & {
    audioRef: RefObject<HTMLAudioElement>;
}>;
export default Visualizer;
