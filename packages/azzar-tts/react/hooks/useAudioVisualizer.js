import _toConsumableArray from "@babel/runtime/helpers/esm/toConsumableArray";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import { throttle } from 'lodash-es';
import { useCallback, useEffect, useRef, useState } from 'react';
export var useAudioVisualizer = function useAudioVisualizer(audioRef, _ref) {
  var _audioRef$current;
  var _ref$count = _ref.count,
    count = _ref$count === void 0 ? 5 : _ref$count;
  var barsSet = Array.from({
    length: (count + 1) / 2
  }).fill(0);
  var _useState = useState([0, 0, 0, 0]),
    _useState2 = _slicedToArray(_useState, 2),
    bars = _useState2[0],
    setBars = _useState2[1];
  var audioContextRef = useRef(null);
  var analyserRef = useRef(null);
  var dataArrayRef = useRef(null);
  var animationFrameIdRef = useRef(null);
  var audioSourceRef = useRef(null);
  var _useState3 = useState(false),
    _useState4 = _slicedToArray(_useState3, 2),
    init = _useState4[0],
    setInit = _useState4[1];
  var renderFrame = throttle(function () {
    animationFrameIdRef.current = requestAnimationFrame(renderFrame);
    if (analyserRef.current && dataArrayRef.current) {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      var step = Math.floor(dataArrayRef.current.length / barsSet.length);
      var newBars = barsSet.map(function (_, i) {
        var _dataArrayRef$current;
        return ((_dataArrayRef$current = dataArrayRef.current) === null || _dataArrayRef$current === void 0 ? void 0 : _dataArrayRef$current[i * step]) || 0;
      });
      setBars(newBars);
    }
  }, 50);
  var resetRenderFrame = useCallback(function () {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    setBars(barsSet);
  }, []);
  useEffect(function () {
    if (!audioRef.current || !audioRef.current.currentSrc) return;
    try {
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      var bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      audioSourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      audioSourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
    } catch (error) {
      console.error('Error useAudioVisualizer:', error);
    }
    setInit(true);
    return function () {
      var _audioSourceRef$curre, _analyserRef$current, _audioContextRef$curr;
      (_audioSourceRef$curre = audioSourceRef.current) === null || _audioSourceRef$curre === void 0 || _audioSourceRef$curre.disconnect();
      (_analyserRef$current = analyserRef.current) === null || _analyserRef$current === void 0 || _analyserRef$current.disconnect();
      (_audioContextRef$curr = audioContextRef.current) === null || _audioContextRef$curr === void 0 || _audioContextRef$curr.close();
      setInit(false);
    };
  }, [audioRef === null || audioRef === void 0 || (_audioRef$current = audioRef.current) === null || _audioRef$current === void 0 ? void 0 : _audioRef$current.currentSrc]);
  useEffect(function () {
    if (!init) return;
    resetRenderFrame();
    renderFrame();
    return function () {
      resetRenderFrame();
    };
  }, [init]);
  var reverseBars = _toConsumableArray(bars).slice(1, bars.length).reverse();
  return [].concat(_toConsumableArray(reverseBars), _toConsumableArray(bars));
};