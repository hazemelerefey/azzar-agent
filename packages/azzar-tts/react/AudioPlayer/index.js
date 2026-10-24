import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import { ActionIcon, Tag } from '@azzar/ui';
import { Slider } from 'antd';
import { Download, PauseCircle, Play, StopCircle } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { secondsToMinutesAndSeconds } from "../../core/utils/secondsToMinutesAndSeconds";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var AudioPlayer = /*#__PURE__*/memo(function (_ref) {
  var isLoading = _ref.isLoading,
    style = _ref.style,
    timeStyle = _ref.timeStyle,
    buttonSize = _ref.buttonSize,
    className = _ref.className,
    onLoadingStop = _ref.onLoadingStop,
    _ref$audio = _ref.audio,
    audio = _ref$audio === void 0 ? {
      canPlay: false,
      currentTime: 0,
      download: function download() {},
      duration: 0,
      isPlaying: false,
      pause: function pause() {},
      play: function play() {},
      setTime: function setTime() {},
      stop: function stop() {}
    } : _ref$audio,
    _ref$allowPause = _ref.allowPause,
    allowPause = _ref$allowPause === void 0 ? true : _ref$allowPause,
    _ref$showDonload = _ref.showDonload,
    showDonload = _ref$showDonload === void 0 ? true : _ref$showDonload,
    buttonActive = _ref.buttonActive,
    _ref$timeType = _ref.timeType,
    timeType = _ref$timeType === void 0 ? 'left' : _ref$timeType,
    _ref$showSlider = _ref.showSlider,
    showSlider = _ref$showSlider === void 0 ? true : _ref$showSlider,
    _ref$showTime = _ref.showTime,
    showTime = _ref$showTime === void 0 ? true : _ref$showTime,
    _ref$timeRender = _ref.timeRender,
    timeRender = _ref$timeRender === void 0 ? 'text' : _ref$timeRender,
    onInitPlay = _ref.onInitPlay,
    onPause = _ref.onPause,
    onStop = _ref.onStop,
    title = _ref.title,
    buttonStyle = _ref.buttonStyle,
    onPlay = _ref.onPlay;
  var isPlaying = audio.isPlaying,
    play = audio.play,
    stop = audio.stop,
    pause = audio.pause,
    duration = audio.duration,
    setTime = audio.setTime,
    currentTime = audio.currentTime,
    download = audio.download;
  var formattedLeftTime = secondsToMinutesAndSeconds(duration - currentTime);
  var formattedCurrentTime = secondsToMinutesAndSeconds(currentTime);
  var formattedDuration = secondsToMinutesAndSeconds(duration);
  var Time = useMemo(function () {
    return timeRender === 'tag' ? Tag : function (props) {
      return /*#__PURE__*/_jsx("div", _objectSpread({}, props));
    };
  }, [timeRender]);
  var handlePlay = useCallback(function () {
    if ((!duration || duration === 0) && !isLoading) {
      onInitPlay === null || onInitPlay === void 0 || onInitPlay();
    } else {
      play === null || play === void 0 || play();
      onPlay === null || onPlay === void 0 || onPlay();
    }
  }, [play, duration]);
  var handlePause = useCallback(function () {
    pause === null || pause === void 0 || pause();
    onPause === null || onPause === void 0 || onPause();
  }, [pause]);
  var handleStop = useCallback(function () {
    stop === null || stop === void 0 || stop();
    onStop === null || onStop === void 0 || onStop();
  }, [stop]);
  var handleStopLoading = useCallback(function () {
    if (!isLoading) return;
    onLoadingStop === null || onLoadingStop === void 0 || onLoadingStop();
    stop === null || stop === void 0 || stop();
    onStop === null || onStop === void 0 || onStop();
  }, [stop, isLoading]);
  return /*#__PURE__*/_jsxs(Flexbox, {
    align: 'center',
    className: className,
    gap: 8,
    horizontal: true,
    style: _objectSpread({
      width: '100%'
    }, style),
    children: [/*#__PURE__*/_jsx("div", {
      onClick: handleStopLoading,
      style: {
        flex: 'none'
      },
      children: /*#__PURE__*/_jsx(ActionIcon, {
        active: buttonActive,
        icon: isPlaying ? allowPause ? PauseCircle : StopCircle : Play,
        loading: isLoading,
        onClick: isPlaying ? allowPause ? handlePause : handleStop : handlePlay,
        size: buttonSize || {
          blockSize: 32,
          fontSize: 16
        },
        style: buttonStyle,
        title: title
      })
    }), showSlider && /*#__PURE__*/_jsx(Slider, {
      disabled: duration === 0 || isLoading,
      max: duration,
      min: 0,
      onChange: function onChange(e) {
        return setTime(e);
      },
      step: 0.01,
      style: {
        flex: 1
      },
      tooltip: {
        formatter: secondsToMinutesAndSeconds
      },
      value: currentTime
    }), showTime && /*#__PURE__*/_jsxs(Time, {
      style: _objectSpread({
        cursor: 'pointer',
        flex: 'none',
        margin: 0
      }, timeStyle),
      children: [timeType === 'left' && formattedLeftTime, timeType === 'current' && formattedCurrentTime, timeType === 'combine' && /*#__PURE__*/_jsxs("span", {
        children: [formattedCurrentTime, /*#__PURE__*/_jsx("span", {
          style: {
            opacity: 0.66
          },
          children: " / ".concat(formattedDuration)
        })]
      })]
    }), !isLoading && showDonload && /*#__PURE__*/_jsx(ActionIcon, {
      icon: Download,
      onClick: download,
      size: buttonSize || {
        blockSize: 32,
        fontSize: 16
      },
      style: buttonStyle
    })]
  });
});
export default AudioPlayer;