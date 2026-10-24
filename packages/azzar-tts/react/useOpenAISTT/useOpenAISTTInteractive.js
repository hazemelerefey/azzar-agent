import _regeneratorRuntime from "@babel/runtime/helpers/esm/regeneratorRuntime";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["onBlobAvailable", "onTextChange", "onSuccess", "onError", "onFinished", "onStart", "onStop", "options", "onRecognitionStop", "onRecognitionStart", "onRecognitionError", "onRecognitionFinish"];
import { useCallback, useState } from 'react';
import { useOpenAISTTCore } from "./useOpenAISTTCore";
import { useSpeechRecognitionInteractive } from "../useSpeechRecognition/useSpeechRecognitionInteractive";
export var useOpenAISTTInteractive = function useOpenAISTTInteractive(locale) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
    _onBlobAvailable = _ref.onBlobAvailable,
    _onTextChange = _ref.onTextChange,
    _onSuccess = _ref.onSuccess,
    _onError = _ref.onError,
    onFinished = _ref.onFinished,
    onStart = _ref.onStart,
    onStop = _ref.onStop,
    options = _ref.options,
    onRecognitionStop = _ref.onRecognitionStop,
    onRecognitionStart = _ref.onRecognitionStart,
    onRecognitionError = _ref.onRecognitionError,
    onRecognitionFinish = _ref.onRecognitionFinish,
    restConfig = _objectWithoutProperties(_ref, _excluded);
  var _useState = useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    isGlobalLoading = _useState2[0],
    setIsGlobalLoading = _useState2[1];
  var _useState3 = useState(false),
    _useState4 = _slicedToArray(_useState3, 2),
    shouldFetch = _useState4[0],
    setShouldFetch = _useState4[1];
  var _useState5 = useState(),
    _useState6 = _slicedToArray(_useState5, 2),
    text = _useState6[0],
    setText = _useState6[1];
  var _useSpeechRecognition = useSpeechRecognitionInteractive(locale, {
      onBlobAvailable: function onBlobAvailable(blobData) {
        if (!text || !blobData) {
          setIsGlobalLoading(false);
          stop();
          return;
        }
        setShouldFetch(true);
        _onBlobAvailable === null || _onBlobAvailable === void 0 || _onBlobAvailable(blobData);
      },
      onRecognitionError: onRecognitionError,
      onRecognitionFinish: onRecognitionFinish,
      onRecognitionStart: onRecognitionStart,
      onRecognitionStop: onRecognitionStop,
      onTextChange: function onTextChange(data) {
        setText(data);
        _onTextChange === null || _onTextChange === void 0 || _onTextChange(data);
      }
    }),
    start = _useSpeechRecognition.start,
    stop = _useSpeechRecognition.stop,
    blob = _useSpeechRecognition.blob,
    url = _useSpeechRecognition.url,
    isRecording = _useSpeechRecognition.isRecording,
    time = _useSpeechRecognition.time,
    formattedTime = _useSpeechRecognition.formattedTime;
  var handleStart = useCallback(function () {
    onStart === null || onStart === void 0 || onStart();
    setIsGlobalLoading(true);
    start();
    setText('');
  }, [start]);
  var handleStop = useCallback(function () {
    onStop === null || onStop === void 0 || onStop();
    stop();
    setShouldFetch(false);
    setIsGlobalLoading(false);
  }, [stop]);
  var _useOpenAISTTCore = useOpenAISTTCore(_objectSpread({
      onError: function onError(err) {
        for (var _len = arguments.length, rest = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          rest[_key - 1] = arguments[_key];
        }
        _onError === null || _onError === void 0 || _onError.apply(void 0, [err].concat(rest));
        console.error('Error useOpenAISTTInteractive:', err);
        handleStop();
      },
      onSuccess: function () {
        var _onSuccess2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(res) {
          var _len2,
            rest,
            _key2,
            json,
            text,
            _args = arguments;
          return _regeneratorRuntime().wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                for (_len2 = _args.length, rest = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                  rest[_key2 - 1] = _args[_key2];
                }
                _onSuccess === null || _onSuccess === void 0 || _onSuccess.apply(void 0, [res].concat(rest));
                _context.next = 4;
                return res.json();
              case 4:
                json = _context.sent;
                text = json.text;
                setText(text);
                _onTextChange === null || _onTextChange === void 0 || _onTextChange(text);
                handleStop();
                onFinished === null || onFinished === void 0 || onFinished.apply(void 0, [res].concat(rest));
              case 10:
              case "end":
                return _context.stop();
            }
          }, _callee);
        }));
        function onSuccess(_x) {
          return _onSuccess2.apply(this, arguments);
        }
        return onSuccess;
      }(),
      options: options,
      shouldFetch: shouldFetch,
      speech: blob
    }, restConfig)),
    isLoading = _useOpenAISTTCore.isLoading,
    error = _useOpenAISTTCore.error,
    mutate = _useOpenAISTTCore.mutate,
    response = _useOpenAISTTCore.data;
  return {
    blob: blob,
    error: error,
    formattedTime: formattedTime,
    isLoading: isGlobalLoading || isLoading || isRecording,
    isRecording: isRecording,
    mutate: mutate,
    response: response,
    start: handleStart,
    stop: handleStop,
    text: text,
    time: time,
    url: url
  };
};