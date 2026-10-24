import _regeneratorRuntime from "@babel/runtime/helpers/esm/regeneratorRuntime";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
export var createOpenaiAudioSpeech = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(_ref) {
    var payload, openai, options, input;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          payload = _ref.payload, openai = _ref.openai;
          options = payload.options, input = payload.input;
          return _context.abrupt("return", openai.audio.speech.create({
            input: input,
            model: options.model,
            voice: options.voice
          }, {
            headers: {
              Accept: '*/*'
            }
          }));
        case 3:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return function createOpenaiAudioSpeech(_x) {
    return _ref2.apply(this, arguments);
  };
}();