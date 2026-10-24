import _regeneratorRuntime from "@babel/runtime/helpers/esm/regeneratorRuntime";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["shouldFetch", "api", "options", "speech"];
import useSWR from 'swr';
import { OpenaiSTT } from "../../core/OpenAISTT";
export var useOpenAISTTCore = function useOpenAISTTCore(init) {
  var key = new Date().getDate().toString();
  var shouldFetch = init.shouldFetch,
    api = init.api,
    options = init.options,
    speech = init.speech,
    swrConfig = _objectWithoutProperties(init, _excluded);
  return useSWR(shouldFetch && speech ? key : null, /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
    var instance;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          instance = new OpenaiSTT(api);
          return _context.abrupt("return", instance.create({
            options: options,
            speech: speech
          }));
        case 2:
        case "end":
          return _context.stop();
      }
    }, _callee);
  })), swrConfig);
};