import _toConsumableArray from "@babel/runtime/helpers/esm/toConsumableArray";
import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _regeneratorRuntime from "@babel/runtime/helpers/esm/regeneratorRuntime";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["onError", "onSuccess", "onFinish", "onStart", "onStop"],
  _excluded2 = ["load", "reset"];
import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';
import { splitTextIntoSegments } from "../../core/utils/splitTextIntoSegments";
import { useStreamAudioPlayer } from "../hooks/useStreamAudioPlayer";
export var useTTS = function useTTS(key, text, fetchTTS) {
  var _ref = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {},
    _onError = _ref.onError,
    _onSuccess = _ref.onSuccess,
    onFinish = _ref.onFinish,
    onStart = _ref.onStart,
    onStop = _ref.onStop,
    restSWRConfig = _objectWithoutProperties(_ref, _excluded);
  var _useState = useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    shouldFetch = _useState2[0],
    setShouldFetch = _useState2[1];
  var _useState3 = useState(false),
    _useState4 = _slicedToArray(_useState3, 2),
    isGlobalLoading = _useState4[0],
    setIsGlobalLoading = _useState4[1];
  var _useState5 = useState(0),
    _useState6 = _slicedToArray(_useState5, 2),
    index = _useState6[0],
    setIndex = _useState6[1];
  var _useState7 = useState([]),
    _useState8 = _slicedToArray(_useState7, 2),
    textArray = _useState8[0],
    setTextArray = _useState8[1];
  var _useStreamAudioPlayer = useStreamAudioPlayer(),
    load = _useStreamAudioPlayer.load,
    reset = _useStreamAudioPlayer.reset,
    restAudio = _objectWithoutProperties(_useStreamAudioPlayer, _excluded2);
  var handleReset = useCallback(function () {
    var newText = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    setShouldFetch(false);
    setIsGlobalLoading(false);
    reset();
    setIndex(0);
    setTextArray(newText);
  }, []);
  var handleStop = useCallback(function () {
    onStop === null || onStop === void 0 || onStop();
    handleReset([]);
  }, [handleReset]);
  var _useSWR = useSWR(shouldFetch && (textArray === null || textArray === void 0 ? void 0 : textArray.length) > 0 ? [key, textArray === null || textArray === void 0 ? void 0 : textArray[index]] : null, /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return fetchTTS(textArray[index]);
          case 2:
            return _context.abrupt("return", _context.sent);
          case 3:
          case "end":
            return _context.stop();
        }
      }, _callee);
    })), _objectSpread({
      onError: function onError(err) {
        for (var _len = arguments.length, rest = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          rest[_key - 1] = arguments[_key];
        }
        _onError === null || _onError === void 0 || _onError.apply(void 0, [err].concat(rest));
        console.error('Error useTTS:', err);
        handleReset();
      },
      onSuccess: function onSuccess(data) {
        for (var _len2 = arguments.length, rest = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          rest[_key2 - 1] = arguments[_key2];
        }
        _onSuccess === null || _onSuccess === void 0 || _onSuccess.apply(void 0, [data].concat(rest));
        load(data);
        if (index < textArray.length - 1) {
          setIndex(index + 1);
        } else {
          onFinish === null || onFinish === void 0 || onFinish.apply(void 0, [[].concat(_toConsumableArray(restAudio.arrayBuffers), [data]).filter(Boolean)].concat(rest));
          setShouldFetch(false);
          setIsGlobalLoading(false);
        }
      }
    }, restSWRConfig)),
    isLoading = _useSWR.isLoading,
    error = _useSWR.error,
    mutate = _useSWR.mutate;
  var handleStart = useCallback(function () {
    if (!text || isLoading) return;
    onStart === null || onStart === void 0 || onStart();
    reset();
    setShouldFetch(true);
    setIsGlobalLoading(true);
  }, [text, isLoading]);
  useEffect(function () {
    var texts = splitTextIntoSegments(text);
    handleReset(texts);
    return function () {
      handleReset();
    };
  }, [text]);
  return {
    audio: restAudio,
    canStart: !isLoading && !!text,
    error: error,
    isGlobalLoading: isGlobalLoading,
    isLoading: isLoading,
    mutate: mutate,
    start: handleStart,
    stop: handleStop
  };
};