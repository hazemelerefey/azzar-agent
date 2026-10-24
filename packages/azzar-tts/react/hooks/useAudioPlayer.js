import _regeneratorRuntime from "@babel/runtime/helpers/esm/regeneratorRuntime";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import { useCallback, useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
export var useAudioPlayer = function useAudioPlayer() {
  var _audioRef$current2;
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
    src = _ref.src,
    _ref$type = _ref.type,
    type = _ref$type === void 0 ? 'audio/mp3' : _ref$type;
  var audioRef = useRef();
  var _useState = useState([]),
    _useState2 = _slicedToArray(_useState, 2),
    arrayBuffers = _useState2[0],
    setArrayBuffers = _useState2[1];
  var _useState3 = useState(0),
    _useState4 = _slicedToArray(_useState3, 2),
    currentTime = _useState4[0],
    setCurrentTime = _useState4[1];
  var _useState5 = useState(0),
    _useState6 = _slicedToArray(_useState5, 2),
    duration = _useState6[0],
    setDuration = _useState6[1];
  var _useState7 = useState(false),
    _useState8 = _slicedToArray(_useState7, 2),
    isPlaying = _useState8[0],
    setIsPlaying = _useState8[1];
  var _useState9 = useState(true),
    _useState10 = _slicedToArray(_useState9, 2),
    isGlobalLoading = _useState10[0],
    setIsGlobalLoading = _useState10[1];
  var _useSWR = useSWR(src || null, /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
      var data, arrayBuffer, newBlob;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            if (src) {
              _context.next = 2;
              break;
            }
            return _context.abrupt("return");
          case 2:
            setIsGlobalLoading(true);
            _context.next = 5;
            return fetch(src);
          case 5:
            data = _context.sent;
            _context.next = 8;
            return data.arrayBuffer();
          case 8:
            arrayBuffer = _context.sent;
            setArrayBuffers([arrayBuffer]);
            newBlob = new Blob([arrayBuffer], {
              type: type
            });
            if (!audioRef.current) audioRef.current = new Audio();
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            if (audioRef.current.src) URL.revokeObjectURL(audioRef.current.src);
            audioRef.current.src = URL.createObjectURL(newBlob);
            audioRef.current.load();
          case 17:
          case "end":
            return _context.stop();
        }
      }, _callee);
    }))),
    isLoading = _useSWR.isLoading;
  useEffect(function () {
    if (!audioRef.current) audioRef.current = new Audio();
    var onLoadedMetadata = function onLoadedMetadata() {
      if (!audioRef.current) return;
      setDuration(audioRef.current.duration);
      setIsGlobalLoading(false);
    };
    var onTimeUpdate = function onTimeUpdate() {
      if (!audioRef.current) return;
      setCurrentTime(audioRef.current.currentTime);
    };
    var onEnded = /*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              if (audioRef.current) {
                _context2.next = 2;
                break;
              }
              return _context2.abrupt("return");
            case 2:
              setIsPlaying(false);
              audioRef.current.currentTime = 0;
              setCurrentTime(0);
            case 5:
            case "end":
              return _context2.stop();
          }
        }, _callee2);
      }));
      return function onEnded() {
        return _ref3.apply(this, arguments);
      };
    }();
    audioRef.current.addEventListener('ended', onEnded);
    audioRef.current.addEventListener('loadedmetadata', onLoadedMetadata);
    audioRef.current.addEventListener('timeupdate', onTimeUpdate);
    return function () {
      if (!audioRef.current) return;
      audioRef.current.pause();
      audioRef.current.load();
      audioRef.current.removeEventListener('ended', onEnded);
      audioRef.current.removeEventListener('loadedmetadata', onLoadedMetadata);
      audioRef.current.removeEventListener('timeupdate', onTimeUpdate);
      setIsGlobalLoading(true);
    };
  }, []);
  var handlePlay = useCallback(function () {
    try {
      var _audioRef$current;
      if (!audioRef.current) return;
      setIsPlaying(true);
      (_audioRef$current = audioRef.current) === null || _audioRef$current === void 0 || _audioRef$current.play();
    } catch (_unused) {
      setTimeout(function () {
        handlePlay();
      }, 200);
    }
  }, []);
  var handlePause = useCallback(function () {
    if (!audioRef.current) return;
    setIsPlaying(false);
    audioRef.current.pause();
  }, []);
  var handleStop = useCallback(function () {
    if (!audioRef.current) return;
    setIsPlaying(false);
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }, []);
  var setTime = useCallback(function (value) {
    if (!audioRef.current) return;
    setCurrentTime(value);
    audioRef.current.currentTime = value;
  }, []);
  var reset = useCallback(function () {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    if (audioRef.current.src) URL.revokeObjectURL(audioRef.current.src);
    audioRef.current.src = '';
    setDuration(0);
    setCurrentTime(0);
  }, []);
  var handleDownload = useCallback( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
    var a;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          if (audioRef.current) {
            _context3.next = 2;
            break;
          }
          return _context3.abrupt("return");
        case 2:
          a = document.createElement('a');
          a.href = audioRef.current.src;
          a.download = 'audio.mp3';
          a.click();
        case 6:
        case "end":
          return _context3.stop();
      }
    }, _callee3);
  })), []);
  return {
    arrayBuffers: arrayBuffers,
    currentTime: currentTime,
    download: handleDownload,
    duration: duration,
    isLoading: isLoading || isGlobalLoading,
    isPlaying: isPlaying,
    pause: handlePause,
    play: handlePlay,
    ref: audioRef,
    reset: reset,
    setTime: setTime,
    stop: handleStop,
    url: (audioRef === null || audioRef === void 0 || (_audioRef$current2 = audioRef.current) === null || _audioRef$current2 === void 0 ? void 0 : _audioRef$current2.src) || ''
  };
};