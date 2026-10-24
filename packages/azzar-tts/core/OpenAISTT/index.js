import _regeneratorRuntime from "@babel/runtime/helpers/esm/regeneratorRuntime";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import _createClass from "@babel/runtime/helpers/esm/createClass";
import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import urlJoin from 'url-join';
import { OPENAI_BASE_URL } from "../const/api";
import { getRecordMineType } from "../utils/getRecordMineType";
var genSTTBody = function genSTTBody(_ref) {
  var speech = _ref.speech,
    options = _ref.options;
  var mineType = (options === null || options === void 0 ? void 0 : options.mineType) || getRecordMineType();
  var filename = "".concat(Date.now(), ".").concat(mineType.extension);
  var file = new File([speech], filename, {
    type: mineType.mineType
  });
  var body = new FormData();
  body.append('file', file);
  body.append('model', (options === null || options === void 0 ? void 0 : options.model) || 'whisper-1');
  return body;
};
var genServiceSTTBody = function genServiceSTTBody(_ref2) {
  var speech = _ref2.speech,
    options = _ref2.options;
  var mineType = (options === null || options === void 0 ? void 0 : options.mineType) || getRecordMineType();
  var filename = "".concat(Date.now(), ".").concat(mineType.extension);
  var body = new FormData();
  body.append('options', JSON.stringify(options));
  body.append('speech', speech, filename);
  return body;
};
export var OpenaiSTT = /*#__PURE__*/_createClass(function OpenaiSTT() {
  var _this = this;
  var api = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  _classCallCheck(this, OpenaiSTT);
  _defineProperty(this, "OPENAI_BASE_URL", void 0);
  _defineProperty(this, "OPENAI_API_KEY", void 0);
  _defineProperty(this, "serviceUrl", void 0);
  _defineProperty(this, "headers", void 0);
  _defineProperty(this, "fetch", /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(payload) {
      var url;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            url = urlJoin(_this.OPENAI_BASE_URL, 'audio/speech');
            return _context.abrupt("return", _this.serviceUrl ? fetch(_this.serviceUrl, {
              body: genServiceSTTBody(payload),
              headers: _this.headers,
              method: 'POST'
            }) : fetch(url, {
              body: genSTTBody(payload),
              headers: new Headers({
                Authorization: "Bearer ".concat(_this.OPENAI_API_KEY)
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
      return _ref3.apply(this, arguments);
    };
  }());
  _defineProperty(this, "create", /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(payload) {
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
      return _ref4.apply(this, arguments);
    };
  }());
  _defineProperty(this, "createText", /*#__PURE__*/function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(payload) {
      var response, json;
      return _regeneratorRuntime().wrap(function _callee3$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return _this.fetch(payload);
          case 2:
            response = _context3.sent;
            _context3.next = 5;
            return response.json();
          case 5:
            json = _context3.sent;
            return _context3.abrupt("return", json.text);
          case 7:
          case "end":
            return _context3.stop();
        }
      }, _callee3);
    }));
    return function (_x3) {
      return _ref5.apply(this, arguments);
    };
  }());
  this.OPENAI_BASE_URL = api.OPENAI_PROXY_URL || OPENAI_BASE_URL;
  this.OPENAI_API_KEY = api.OPENAI_API_KEY;
  this.serviceUrl = api.serviceUrl;
  this.headers = api.headers;
});
_defineProperty(OpenaiSTT, "safeRecordMineType", getRecordMineType);