import { flatten } from 'lodash-es';
import voiceList from "../data/voiceList";
import edgeVoiceList from "./edgeVoiceList";
export var getEdgeVoiceOptions = function getEdgeVoiceOptions(locale) {
  var data = locale && edgeVoiceList[locale] ? edgeVoiceList[locale] || [] : flatten(Object.values(edgeVoiceList));
  return data.map(function (voice) {
    return {
      label: (voiceList === null || voiceList === void 0 ? void 0 : voiceList[voice]) || voice,
      value: voice
    };
  });
};