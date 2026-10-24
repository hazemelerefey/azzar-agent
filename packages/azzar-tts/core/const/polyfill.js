var getSpeechRecognition = function getSpeechRecognition() {
  try {
    var _window, _window2;
    return (globalThis === null || globalThis === void 0 ? void 0 : globalThis.SpeechRecognition) || ((_window = window) === null || _window === void 0 ? void 0 : _window.SpeechRecognition) || ((_window2 = window) === null || _window2 === void 0 ? void 0 : _window2.webkitSpeechRecognition);
  } catch (_unused) {}
};
var getSpeechSynthesis = function getSpeechSynthesis() {
  try {
    var _window3, _window4;
    return (globalThis === null || globalThis === void 0 ? void 0 : globalThis.speechSynthesis) || ((_window3 = window) === null || _window3 === void 0 ? void 0 : _window3.speechSynthesis) || ((_window4 = window) === null || _window4 === void 0 ? void 0 : _window4.webkitSpeechSynthesis);
  } catch (_unused2) {}
};
var getSpeechSynthesisUtterance = function getSpeechSynthesisUtterance() {
  try {
    var _window5, _window6;
    return (globalThis === null || globalThis === void 0 ? void 0 : globalThis.SpeechSynthesisUtterance) || ((_window5 = window) === null || _window5 === void 0 ? void 0 : _window5.SpeechSynthesisUtterance) || ((_window6 = window) === null || _window6 === void 0 ? void 0 : _window6.webkitSpeechSynthesisUtterance);
  } catch (_unused3) {}
};
export var SpeechRecognition = getSpeechRecognition();
export var SpeechSynthesis = getSpeechSynthesis();
export var SpeechSynthesisUtterance = getSpeechSynthesisUtterance();