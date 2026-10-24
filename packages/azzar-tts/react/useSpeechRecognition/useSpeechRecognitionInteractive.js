import _toConsumableArray from "@babel/runtime/helpers/esm/toConsumableArray";
import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["onBlobAvailable", "onTextChange", "onRecognitionFinish", "onStop", "onStart"];
import { useCallback, useEffect, useState } from 'react';
import { useAudioRecorder } from "../useAudioRecorder";
import { useSpeechRecognitionCore } from "./useSpeechRecognitionCore";
export var useSpeechRecognitionInteractive = function useSpeechRecognitionInteractive(locale) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
    onBlobAvailable = _ref.onBlobAvailable,
    onTextChange = _ref.onTextChange,
    onRecognitionFinish = _ref.onRecognitionFinish,
    onStop = _ref.onStop,
    onStart = _ref.onStart,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useState = useState(),
    _useState2 = _slicedToArray(_useState, 2),
    resultText = _useState2[0],
    setResultText = _useState2[1];
  var _useState3 = useState([]),
    _useState4 = _slicedToArray(_useState3, 2),
    texts = _useState4[0],
    setTexts = _useState4[1];
  var _useState5 = useState(false),
    _useState6 = _slicedToArray(_useState5, 2),
    isGLobalLoading = _useState6[0],
    setIsGlobalLoading = _useState6[1];
  var _useAudioRecorder = useAudioRecorder(onBlobAvailable),
    time = _useAudioRecorder.time,
    formattedTime = _useAudioRecorder.formattedTime,
    startRecord = _useAudioRecorder.start,
    stopRecord = _useAudioRecorder.stop,
    blob = _useAudioRecorder.blob,
    url = _useAudioRecorder.url;
  var _useSpeechRecognition = useSpeechRecognitionCore(locale, _objectSpread({
      onRecognitionFinish: function onRecognitionFinish(data) {
        if (isGLobalLoading && !isLoading) {
          if (data) setTexts([].concat(_toConsumableArray(texts), [data]));
          start();
        }
      }
    }, rest)),
    text = _useSpeechRecognition.text,
    stop = _useSpeechRecognition.stop,
    start = _useSpeechRecognition.start,
    isLoading = _useSpeechRecognition.isLoading;
  var handleStart = useCallback(function () {
    onStart === null || onStart === void 0 || onStart();
    setTexts([]);
    setIsGlobalLoading(true);
    start();
    startRecord();
  }, [start, startRecord]);
  var handleStop = useCallback(function () {
    onStop === null || onStop === void 0 || onStop();
    stop();
    stopRecord();
    setIsGlobalLoading(false);
    if (resultText) {
      onRecognitionFinish === null || onRecognitionFinish === void 0 || onRecognitionFinish(resultText);
    }
  }, [stop, stopRecord, resultText]);
  useEffect(function () {
    var mergedText = [].concat(_toConsumableArray(texts), [text]).filter(Boolean).join(' ');
    setResultText(mergedText);
    onTextChange === null || onTextChange === void 0 || onTextChange(mergedText);
  }, [texts, text]);
  return {
    blob: blob,
    formattedTime: formattedTime,
    isLoading: isGLobalLoading,
    isRecording: isGLobalLoading,
    response: new Response(JSON.stringify({
      text: resultText
    }), {
      status: 200
    }),
    start: handleStart,
    stop: handleStop,
    text: resultText,
    time: time,
    url: url
  };
};