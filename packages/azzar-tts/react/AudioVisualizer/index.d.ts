import { CSSProperties, RefObject } from 'react';
import { VisualizerProps } from './Visualizer';
export interface AudioVisualizerProps {
    audioRef: RefObject<HTMLAudioElement>;
    barStyle?: VisualizerProps;
    className?: string;
    color?: string;
    isLoading?: boolean;
    style?: CSSProperties;
}
declare const AudioVisualizer: import("react").NamedExoticComponent<AudioVisualizerProps>;
export default AudioVisualizer;
