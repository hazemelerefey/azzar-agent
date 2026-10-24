import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import { useCallback, useEffect, useState } from 'react';
import { SpeechRecognition } from "../../core/const/polyfill";
export var useSpeechRecognitionCore = function useSpeechRecognitionCore(locale) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
    onTextChange = _ref.onTextChange,
    onRecognitionStart = _ref.onRecognitionStart,
    onRecognitionFinish = _ref.onRecognitionFinish,
    onRecognitionStop = _ref.onRecognitionStop,
    onRecognitionError = _ref.onRecognitionError;
  var _useState = useState(null),
    _useState2 = _slicedToArray(_useState, 2),
    recognition = _useState2[0],
    setRecognition = _useState2[1];
  var _useState3 = useState(''),
    _useState4 = _slicedToArray(_useState3, 2),
    text = _useState4[0],
    setText = _useState4[1];
  var _useState5 = useState(false),
    _useState6 = _slicedToArray(_useState5, 2),
    isLoading = _useState6[0],
    setIsLoading = _useState6[1];
  var _useState7 = useState(false),
    _useState8 = _slicedToArray(_useState7, 2),
    isFinalStop = _useState8[0],
    setFinalStop = _useState8[1];
  useEffect(function () {
    if (recognition) return;
    try {
      var speechRecognition = new SpeechRecognition();
      speechRecognition.interimResults = true;
      speechRecognition.continuous = true;
      speechRecognition.onstart = function () {
        setFinalStop(false);
        setIsLoading(true);
      };
      speechRecognition.onend = function () {
        setIsLoading(false);
        setFinalStop(true);
      };
      speechRecognition.onresult = function (_ref2) {
        var _result$;
        var results = _ref2.results;
        if (!results) return;
        var result = results[0];
        if (!isFinalStop && result !== null && result !== void 0 && (_result$ = result[0]) !== null && _result$ !== void 0 && _result$.transcript) {
          var _value = result[0].transcript;
          setText(_value);
          onTextChange === null || onTextChange === void 0 || onTextChange(_value);
        }
        if (result.isFinal) {
          speechRecognition.abort();
        }
      };
      setRecognition(speechRecognition);
    } catch (error) {
      console.error('Error useSpeechRecognitionCore:', error);
      onRecognitionError === null || onRecognitionError === void 0 || onRecognitionError(error);
    }
  }, [isFinalStop]);
  useEffect(function () {
    if (!isLoading && text) {
      onRecognitionFinish === null || onRecognitionFinish === void 0 || onRecognitionFinish(text);
    }
  }, [text, isLoading]);
  useEffect(function () {
    if (recognition) recognition.lang = locale;
  }, [recognition, locale]);
  var handleStart = useCallback(function () {
    setText('');
    onTextChange === null || onTextChange === void 0 || onTextChange('');
    try {
      recognition.start();
      onRecognitionStart === null || onRecognitionStart === void 0 || onRecognitionStart();
    } catch (error) {
      console.error('Error useSpeechRecognitionCore:', 'start', error);
      onRecognitionError === null || onRecognitionError === void 0 || onRecognitionError(error);
    }
  }, [recognition]);
  var handleStop = useCallback(function () {
    try {
      recognition.abort();
      onRecognitionStop === null || onRecognitionStop === void 0 || onRecognitionStop();
    } catch (error) {
      console.error('Error useSpeechRecognitionCore:', 'stop', error);
      onRecognitionError === null || onRecognitionError === void 0 || onRecognitionError(error);
    }
    setIsLoading(false);
  }, [recognition]);
  return {
    isLoading: isLoading,
    start: handleStart,
    stop: handleStop,
    text: text
  };
};