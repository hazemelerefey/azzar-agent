import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime/helpers/esm/createClass";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { getEdgeVoiceOptions } from "./EdgeSpeechTTS/options";
import { getAzureVoiceOptions } from "./MicrosoftSpeechTTS/voiceList";
import { getOpenaiVoiceOptions } from "./OpenAITTS/voiceList";
import { getSpeechSynthesisVoiceOptions } from "./SpeechSynthesisTTS/options";
import { getVoiceLocaleOptions } from "./utils/getVoiceList";
export var VoiceList = /*#__PURE__*/function () {
  function VoiceList(locale) {
    _classCallCheck(this, VoiceList);
    _defineProperty(this, "locale", void 0);
    this.locale = locale;
  }
  _createClass(VoiceList, [{
    key: "speechSynthesVoiceOptions",
    get: function get() {
      return getSpeechSynthesisVoiceOptions(this.locale);
    }
  }, {
    key: "azureVoiceOptions",
    get: function get() {
      return getAzureVoiceOptions(this.locale);
    }
  }, {
    key: "edgeVoiceOptions",
    get: function get() {
      return getEdgeVoiceOptions(this.locale);
    }
  }, {
    key: "microsoftVoiceOptions",
    get: function get() {
      return getEdgeVoiceOptions(this.locale);
    }
  }]);
  return VoiceList;
}();
_defineProperty(VoiceList, "openaiVoiceOptions", getOpenaiVoiceOptions());
_defineProperty(VoiceList, "localeOptions", getVoiceLocaleOptions());