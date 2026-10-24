import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime/helpers/esm/createClass";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { getVoiceLocaleOptions } from "../utils/getVoiceList";
import { getSpeechSynthesisVoiceOptions } from "./options";
import speechSynthesisVoiceList from "./voiceList";
export var SpeechSynthesisTTS = /*#__PURE__*/function () {
  function SpeechSynthesisTTS(locale) {
    _classCallCheck(this, SpeechSynthesisTTS);
    _defineProperty(this, "locale", void 0);
    this.locale = locale;
  }
  _createClass(SpeechSynthesisTTS, [{
    key: "voiceOptions",
    get: function get() {
      return getSpeechSynthesisVoiceOptions(this.locale);
    }
  }]);
  return SpeechSynthesisTTS;
}();
_defineProperty(SpeechSynthesisTTS, "localeOptions", getVoiceLocaleOptions());
_defineProperty(SpeechSynthesisTTS, "voiceList", speechSynthesisVoiceList);