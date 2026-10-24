import _regeneratorRuntime from "@babel/runtime/helpers/esm/regeneratorRuntime";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime/helpers/esm/createClass";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import styleList from "../data/styleList";
import voiceName from "../data/voiceList";
import { arrayBufferConvert } from "../utils/arrayBufferConvert";
import { getVoiceLocaleOptions } from "../utils/getVoiceList";
import { createMicrosoftSpeech } from "./createMicrosoftSpeech";
import azureVoiceList, { getAzureVoiceOptions } from "./voiceList";
export var MicrosoftSpeechTTS = /*#__PURE__*/function () {
  function MicrosoftSpeechTTS() {
    var _this = this;
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      serviceUrl = _ref.serviceUrl,
      locale = _ref.locale,
      headers = _ref.headers;
    _classCallCheck(this, MicrosoftSpeechTTS);
    _defineProperty(this, "locale", void 0);
    _defineProperty(this, "serviceUrl", void 0);
    _defineProperty(this, "headers", void 0);
    _defineProperty(this, "fetch", /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(payload) {
        var response;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _this.serviceUrl ? fetch(_this.serviceUrl, {
                body: JSON.stringify(payload),
                headers: _this.headers,
                method: 'POST'
              }) : createMicrosoftSpeech({
                payload: payload
              });
            case 2:
              response = _context.sent;
              return _context.abrupt("return", response);
            case 4:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }));
      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    }());
    _defineProperty(this, "create", /*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(payload) {
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _this.fetch(payload);
            case 2:
              return _context2.abrupt("return", _context2.sent);
            case 3:
            case "end":
              return _context2.stop();
          }
        }, _callee2);
      }));
      return function (_x2) {
        return _ref3.apply(this, arguments);
      };
    }());
    _defineProperty(this, "createAudio", /*#__PURE__*/function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(payload) {
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
              return _context3.abrupt("return", arrayBufferConvert(arrayBuffer));
            case 7:
            case "end":
              return _context3.stop();
          }
        }, _callee3);
      }));
      return function (_x3) {
        return _ref4.apply(this, arguments);
      };
    }());
    this.locale = locale;
    this.serviceUrl = serviceUrl;
    this.headers = headers;
  }
  _createClass(MicrosoftSpeechTTS, [{
    key: "voiceOptions",
    get: function get() {
      return getAzureVoiceOptions(this.locale);
    }
  }]);
  return MicrosoftSpeechTTS;
}();
_defineProperty(MicrosoftSpeechTTS, "localeOptions", getVoiceLocaleOptions());
_defineProperty(MicrosoftSpeechTTS, "createRequest", createMicrosoftSpeech);
_defineProperty(MicrosoftSpeechTTS, "voiceList", azureVoiceList);
_defineProperty(MicrosoftSpeechTTS, "voiceName", voiceName);
_defineProperty(MicrosoftSpeechTTS, "styleList", styleList);