import _regeneratorRuntime from "@babel/runtime/helpers/esm/regeneratorRuntime";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import { useState } from 'react';
import useSWR from 'swr';
import { arrayBufferConvert } from "../../core/utils/arrayBufferConvert";
import { audioBufferToBlob } from "../../core/utils/audioBufferToBlob";
import { playAudioBlob } from "../../core/utils/playAudioBlob";
export var useBlobUrl = function useBlobUrl(src) {
  var _useState = useState(),
    _useState2 = _slicedToArray(_useState, 2),
    audio = _useState2[0],
    setAudio = _useState2[1];
  var _useState3 = useState(),
    _useState4 = _slicedToArray(_useState3, 2),
    url = _useState4[0],
    setUrl = _useState4[1];
  var _useState5 = useState(),
    _useState6 = _slicedToArray(_useState5, 2),
    blob = _useState6[0],
    setBlob = _useState6[1];
  var _useState7 = useState(true),
    _useState8 = _slicedToArray(_useState7, 2),
    isGlobalLoading = _useState8[0],
    setIsGlobalLoading = _useState8[1];
  var _useSWR = useSWR(src, /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
      var data, buffer;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return fetch(src);
          case 2:
            data = _context.sent;
            if (data) {
              _context.next = 5;
              break;
            }
            return _context.abrupt("return");
          case 5:
            _context.next = 7;
            return data.arrayBuffer();
          case 7:
            buffer = _context.sent;
            _context.next = 10;
            return arrayBufferConvert(buffer);
          case 10:
            return _context.abrupt("return", _context.sent);
          case 11:
          case "end":
            return _context.stop();
        }
      }, _callee);
    })), {
      onSuccess: function () {
        var _onSuccess = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(data) {
          var blob, newAudio;
          return _regeneratorRuntime().wrap(function _callee2$(_context2) {
            while (1) switch (_context2.prev = _context2.next) {
              case 0:
                if (data) {
                  _context2.next = 2;
                  break;
                }
                return _context2.abrupt("return");
              case 2:
                _context2.next = 4;
                return audioBufferToBlob(data);
              case 4:
                blob = _context2.sent;
                if (!(!blob || blob.size === 0)) {
                  _context2.next = 7;
                  break;
                }
                return _context2.abrupt("return");
              case 7:
                if (audio) audio.remove();
                if (url) URL.revokeObjectURL(url);
                setBlob(blob);
                try {
                  newAudio = playAudioBlob(blob);
                  setUrl(newAudio.url);
                  setAudio(newAudio.audio);
                } catch (_unused) {}
                setIsGlobalLoading(false);
              case 12:
              case "end":
                return _context2.stop();
            }
          }, _callee2);
        }));
        function onSuccess(_x) {
          return _onSuccess.apply(this, arguments);
        }
        return onSuccess;
      }()
    }),
    isLoading = _useSWR.isLoading;
  return {
    audio: audio,
    blob: blob,
    isLoading: isGlobalLoading || isLoading,
    url: url
  };
};