import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["voice", "rate", "pitch"];
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SpeechSynthesis, SpeechSynthesisUtterance } from "../../core/const/polyfill";
export var useSpeechSynthes = function useSpeechSynthes(defaultText, _ref) {
  var voice = _ref.voice,
    rate = _ref.rate,
    pitch = _ref.pitch,
    options = _objectWithoutProperties(_ref, _excluded);
  var _useState = useState(SpeechSynthesis === null || SpeechSynthesis === void 0 ? void 0 : SpeechSynthesis.getVoices()),
    _useState2 = _slicedToArray(_useState, 2),
    voiceList = _useState2[0],
    setVoiceList = _useState2[1];
  var _useState3 = useState(defaultText),
    _useState4 = _slicedToArray(_useState3, 2),
    text = _useState4[0],
    setText = _useState4[1];
  var _useState5 = useState(false),
    _useState6 = _slicedToArray(_useState5, 2),
    isLoading = _useState6[0],
    setIsLoading = _useState6[1];
  var speechSynthesisUtterance = useMemo(function () {
    if (!SpeechSynthesisUtterance) return;
    var utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voiceList.find(function (item) {
      return item.name === voice;
    });
    if (pitch) utterance.pitch = pitch * 10;
    if (rate) utterance.rate = rate * 10;
    return utterance;
  }, [text, voiceList, rate, pitch, voice]);
  useEffect(function () {
    if (!SpeechSynthesis) return;
    SpeechSynthesis.onvoiceschanged = function () {
      setVoiceList(SpeechSynthesis === null || SpeechSynthesis === void 0 ? void 0 : SpeechSynthesis.getVoices());
    };
    SpeechSynthesis.onstart = function () {
      return setIsLoading(true);
    };
    SpeechSynthesis.onend = function () {
      return setIsLoading(false);
    };
  }, []);
  var handleStart = useCallback(function () {
    var _options$onStart;
    options === null || options === void 0 || (_options$onStart = options.onStart) === null || _options$onStart === void 0 || _options$onStart.call(options);
    SpeechSynthesis === null || SpeechSynthesis === void 0 || SpeechSynthesis.speak(speechSynthesisUtterance);
  }, [speechSynthesisUtterance]);
  var handleStop = useCallback(function () {
    var _options$onStop, _speechSynthesis;
    options === null || options === void 0 || (_options$onStop = options.onStop) === null || _options$onStop === void 0 || _options$onStop.call(options);
    (_speechSynthesis = speechSynthesis) === null || _speechSynthesis === void 0 || _speechSynthesis.cancel();
    setIsLoading(false);
  }, []);
  return {
    isLoading: isLoading,
    setText: setText,
    start: handleStart,
    stop: handleStop
  };
};