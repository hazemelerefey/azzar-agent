import _regeneratorRuntime from "@babel/runtime/helpers/esm/regeneratorRuntime";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
export var createOpenaiAudioTranscriptions = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(_ref) {
    var payload, openai, speech, options, file, response;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          payload = _ref.payload, openai = _ref.openai;
          speech = payload.speech, options = payload.options;
          file = new File([speech], "".concat(Date.now(), ".").concat(options.mineType.extension), {
            type: options.mineType.mineType
          });
          _context.next = 5;
          return openai.audio.transcriptions.create({
            file: file,
            model: options.model,
            prompt: options.prompt || ''
          }, {
            headers: {
              Accept: '*/*'
            }
          });
        case 5:
          response = _context.sent;
          return _context.abrupt("return", response);
        case 7:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return function createOpenaiAudioTranscriptions(_x) {
    return _ref2.apply(this, arguments);
  };
}();