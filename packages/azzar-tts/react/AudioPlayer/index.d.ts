import { type ActionIconProps } from '@azzar/ui';
import { type CSSProperties } from 'react';
export interface AudioProps {
    currentTime: number;
    download: () => void;
    duration: number;
    isPlaying: boolean;
    pause: () => void;
    play: () => void;
    setTime: (time: number) => void;
    stop: () => void;
}
export interface AudioPlayerProps {
    allowPause?: boolean;
    audio: AudioProps;
    autoplay?: boolean;
    buttonActive?: boolean;
    buttonSize?: ActionIconProps['size'];
    buttonStyle?: CSSProperties;
    className?: string;
    isLoading?: boolean;
    onInitPlay?: () => void;
    onLoadingStop?: () => void;
    onPause?: () => void;
    onPlay?: () => void;
    onStop?: () => void;
    showDonload?: boolean;
    showSlider?: boolean;
    showTime?: boolean;
    style?: CSSProperties;
    timeRender?: 'tag' | 'text';
    timeStyle?: CSSProperties;
    timeType?: 'left' | 'current' | 'combine';
    title?: string;
}
declare const AudioPlayer: import("react").NamedExoticComponent<AudioPlayerProps>;
export default AudioPlayer;
