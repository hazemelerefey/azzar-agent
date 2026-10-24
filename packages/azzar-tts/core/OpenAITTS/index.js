import _regeneratorRuntime from "@babel/runtime/helpers/esm/regeneratorRuntime";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime/helpers/esm/createClass";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import urlJoin from 'url-join';
import { OPENAI_BASE_URL } from "../const/api";
import { arrayBufferConvert } from "../utils/arrayBufferConvert";
import voiceList, { getOpenaiVoiceOptions } from "./voiceList";
export var OpenAITTS = /*#__PURE__*/function () {
  function OpenAITTS() {
    var _this = this;
    var api = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _classCallCheck(this, OpenAITTS);
    _defineProperty(this, "OPENAI_BASE_URL", void 0);
    _defineProperty(this, "OPENAI_API_KEY", void 0);
    _defineProperty(this, "serviceUrl", void 0);
    _defineProperty(this, "headers", void 0);
    _defineProperty(this, "fetch", /*#__PURE__*/function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(payload) {
        var _payload$options;
        var url;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              url = urlJoin(_this.OPENAI_BASE_URL, 'audio/speech');
              return _context.abrupt("return", _this.serviceUrl ? fetch(_this.serviceUrl, {
                body: JSON.stringify(payload),
                headers: _this.headers,
                method: 'POST'
              }) : fetch(url, {
                body: JSON.stringify({
                  input: payload.input,
                  model: ((_payload$options = payload.options) === null || _payload$options === void 0 ? void 0 : _payload$options.model) || 'tts-1',
                  voice: payload.options.voice
                }),
                headers: new Headers({
                  'Authorization': "Bearer ".concat(_this.OPENAI_API_KEY),
                  'Content-Type': 'application/json'
                }),
                method: 'POST'
              }));
            case 2:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }));
      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }());
    _defineProperty(this, "create", /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(payload) {
        var response;
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _this.fetch(payload);
            case 2:
              response = _context2.sent;
              return _context2.abrupt("return", response);
            case 4:
            case "end":
              return _context2.stop();
          }
        }, _callee2);
      }));
      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    }());
    _defineProperty(this, "createAudio", /*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(payload) {
        var response, arrayBuffer;
        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return _this.create(payload);
            case 2:
              response = _context3.sent;
              _context3.next = 5;
              return response.arrayBuffer();
            case 5:
              arrayBuffer = _context3.sent;
              _context3.next = 8;
              return arrayBufferConvert(arrayBuffer);
            case 8:
              return _context3.abrupt("return", _context3.sent);
            case 9:
            case "end":
              return _context3.stop();
          }
        }, _callee3);
      }));
      return function (_x3) {
        return _ref3.apply(this, arguments);
      };
    }());
    this.OPENAI_BASE_URL = api.OPENAI_PROXY_URL || OPENAI_BASE_URL;
    this.OPENAI_API_KEY = api.OPENAI_API_KEY;
    this.serviceUrl = api.serviceUrl;
    this.headers = api.headers;
  }
  _createClass(OpenAITTS, [{
    key: "voiceOptions",
    get: function get() {
      return getOpenaiVoiceOptions();
    }
  }]);
  return OpenAITTS;
}();
_defineProperty(OpenAITTS, "voiceList", voiceList);