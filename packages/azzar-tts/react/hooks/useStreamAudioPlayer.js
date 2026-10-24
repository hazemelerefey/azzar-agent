import _toConsumableArray from "@babel/runtime/helpers/esm/toConsumableArray";
import _regeneratorRuntime from "@babel/runtime/helpers/esm/regeneratorRuntime";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import { useCallback, useEffect, useRef, useState } from 'react';
export var useStreamAudioPlayer = function useStreamAudioPlayer() {
  var _audioRef$current;
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
  var _useState9 = useState(0),
    _useState10 = _slicedToArray(_useState9, 2),
    maxLength = _useState10[0],
    setMaxLength = _useState10[1];
  useEffect(function () {
    try {
      audioRef.current = new Audio();
    } catch (_unused) {}
    if (!audioRef.current) return;
    var onLoadedMetadata = function onLoadedMetadata() {
      if (!audioRef.current) return;
      setDuration(audioRef.current.duration);
    };
    var onTimeUpdate = function onTimeUpdate() {
      if (!audioRef.current) return;
      setCurrentTime(audioRef.current.currentTime);
    };
    audioRef.current.addEventListener('loadedmetadata', onLoadedMetadata);
    audioRef.current.addEventListener('timeupdate', onTimeUpdate);
    return function () {
      if (!audioRef.current) return;
      audioRef.current.pause();
      audioRef.current.load();
      audioRef.current.removeEventListener('loadedmetadata', onLoadedMetadata);
      audioRef.current.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, []);
  useEffect(function () {
    if (!audioRef.current) return;
    var onEnded = /*#__PURE__*/function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        var cacheTime, newBlob, newUrl;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              if (!(!audioRef.current || !audioRef.current.currentSrc)) {
                _context.next = 2;
                break;
              }
              return _context.abrupt("return");
            case 2:
              audioRef.current.pause();
              if (maxLength < arrayBuffers.length) {
                cacheTime = audioRef.current.currentTime;
                newBlob = new Blob(arrayBuffers, {
                  type: 'audio/mp3'
                });
                if (audioRef.current.src) URL.revokeObjectURL(audioRef.current.src);
                newUrl = URL.createObjectURL(newBlob);
                audioRef.current.src = newUrl;
                audioRef.current.load();
                audioRef.current.currentTime = cacheTime;
                audioRef.current.play();
                setMaxLength(arrayBuffers.length);
              } else {
                setIsPlaying(false);
                audioRef.current.currentTime = 0;
                setCurrentTime(0);
              }
            case 4:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }));
      return function onEnded() {
        return _ref.apply(this, arguments);
      };
    }();
    audioRef.current.addEventListener('ended', onEnded);
    return function () {
      if (!audioRef.current) return;
      audioRef.current.removeEventListener('ended', onEnded);
    };
  }, [maxLength, arrayBuffers]);
  var loadArrayBuffer = useCallback( /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(arrayBuffer) {
      var newBlob;
      return _regeneratorRuntime().wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            if (!(!arrayBuffer || !audioRef.current)) {
              _context2.next = 2;
              break;
            }
            return _context2.abrupt("return");
          case 2:
            if (maxLength === 0) {
              newBlob = new Blob([arrayBuffer], {
                type: 'audio/mp3'
              });
              audioRef.current.src = URL.createObjectURL(newBlob);
              audioRef.current.load();
              audioRef.current.play();
              setIsPlaying(true);
              setMaxLength(1);
            }
            setArrayBuffers(function (prev) {
              return [].concat(_toConsumableArray(prev), [arrayBuffer]).filter(Boolean);
            });
          case 4:
          case "end":
            return _context2.stop();
        }
      }, _callee2);
    }));
    return function (_x) {
      return _ref2.apply(this, arguments);
    };
  }(), [maxLength]);
  var handlePlay = useCallback(function () {
    if (!audioRef.current) return;
    if (audioRef.current.duration > 0) {
      setIsPlaying(true);
      audioRef.current.play();
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
    setMaxLength(0);
    setArrayBuffers([]);
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
    isPlaying: isPlaying,
    load: loadArrayBuffer,
    pause: handlePause,
    play: handlePlay,
    ref: audioRef,
    reset: reset,
    setTime: setTime,
    stop: handleStop,
    url: (audioRef === null || audioRef === void 0 || (_audioRef$current = audioRef.current) === null || _audioRef$current === void 0 ? void 0 : _audioRef$current.src) || ''
  };
};