import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["autoStop"];
import { useSpeechRecognitionAutoStop } from "./useSpeechRecognitionAutoStop";
import { useSpeechRecognitionInteractive } from "./useSpeechRecognitionInteractive";
export var useSpeechRecognition = function useSpeechRecognition(locale) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
    autoStop = _ref.autoStop,
    rest = _objectWithoutProperties(_ref, _excluded);
  var selectedHook = autoStop ? useSpeechRecognitionAutoStop : useSpeechRecognitionInteractive;
  return selectedHook(locale, rest);
};