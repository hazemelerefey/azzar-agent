import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import voiceLocale from "../data/locales";
export var getVoiceLocaleOptions = function getVoiceLocaleOptions() {
  return Object.entries(voiceLocale).map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      value = _ref2[0],
      label = _ref2[1];
    return {
      label: label,
      value: value
    };
  });
};