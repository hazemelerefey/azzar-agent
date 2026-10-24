import _createForOfIteratorHelper from "@babel/runtime/helpers/esm/createForOfIteratorHelper";
import { flatten } from 'lodash-es';
import { SpeechSynthesis } from "../const/polyfill";
import voiceLocale from "../data/locales";
import speechSynthesisVoiceList from "./voiceList";
var genSpeechSynthesisVoiceList = function genSpeechSynthesisVoiceList() {
  if (!SpeechSynthesis) return speechSynthesisVoiceList;
  var data = SpeechSynthesis === null || SpeechSynthesis === void 0 ? void 0 : SpeechSynthesis.getVoices();
  if (!data) return speechSynthesisVoiceList;
  var localeKeys = Object.keys(voiceLocale);
  var list = {};
  var _iterator = _createForOfIteratorHelper(data),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var voice = _step.value;
      if (localeKeys.includes(voice.lang)) {
        if (!list[voice.lang]) list[voice.lang] = [];
        list[voice.lang].push(voice.name);
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return Object.keys(list).length > 0 ? list : speechSynthesisVoiceList;
};
export var getSpeechSynthesisVoiceOptions = function getSpeechSynthesisVoiceOptions(locale) {
  var voiceList = genSpeechSynthesisVoiceList();
  var data = locale && voiceList !== null && voiceList !== void 0 && voiceList[locale] ? (voiceList === null || voiceList === void 0 ? void 0 : voiceList[locale]) || [] : flatten(Object.values(voiceList));
  return data.map(function (voice) {
    return {
      label: voice,
      value: voice
    };
  });
};