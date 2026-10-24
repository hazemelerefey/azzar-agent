import _regeneratorRuntime from "@babel/runtime/helpers/esm/regeneratorRuntime";
import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
var _excluded = ["options", "api", "locale"];
import { useState } from 'react';
import { EdgeSpeechTTS } from "../../core/EdgeSpeechTTS";
import { useTTS } from "../useTTS";
export var useEdgeSpeech = function useEdgeSpeech(defaultText, init) {
  var _useState = useState(defaultText),
    _useState2 = _slicedToArray(_useState, 2),
    text = _useState2[0],
    setText = _useState2[1];
  var options = init.options,
    api = init.api,
    locale = init.locale,
    swrConfig = _objectWithoutProperties(init, _excluded);
  var _useState3 = useState(),
    _useState4 = _slicedToArray(_useState3, 2),
    response = _useState4[0],
    setResponse = _useState4[1];
  var rest = useTTS(options.voice, text, /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(segmentText) {
      var instance, res;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            instance = new EdgeSpeechTTS(_objectSpread(_objectSpread({}, api), {}, {
              locale: locale
            }));
            _context.next = 3;
            return instance.create({
              input: segmentText,
              options: options
            });
          case 3:
            res = _context.sent;
            setResponse(res);
            return _context.abrupt("return", res.arrayBuffer());
          case 6:
          case "end":
            return _context.stop();
        }
      }, _callee);
    }));
    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }(), swrConfig);
  return _objectSpread({
    response: response,
    setText: setText
  }, rest);
};