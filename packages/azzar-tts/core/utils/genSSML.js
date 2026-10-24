var voiceTemplate = function voiceTemplate(input, _ref) {
  var voice = _ref.voice;
  return "<voice name=\"".concat(voice, "\">").concat(input, "</voice>");
};
var styleTemplate = function styleTemplate(input, _ref2) {
  var style = _ref2.style;
  if (!style) return input;
  return "<mstts:express-as style=\"".concat(style, "\">").concat(input, "</mstts:express-as>");
};
var prosodyTemplate = function prosodyTemplate(input, _ref3) {
  var pitch = _ref3.pitch,
    rate = _ref3.rate;
  if (!pitch && !rate) return input;
  return "<prosody pitch=\"".concat(Math.floor((pitch || 1) * 100), "%\" rate=\"").concat(Math.floor((rate || 1) * 100), "%\">").concat(input, "</prosody>");
};
var speackTemplate = function speackTemplate(input) {
  return "<speak version=\"1.0\" xmlns=\"http://www.w3.org/2001/10/synthesis\" xmlns:mstts=\"https://www.w3.org/2001/mstts\" xml:lang=\"en-US\">".concat(input, "</speak>");
};
export var genSSML = function genSSML(input, options) {
  var ssml = prosodyTemplate(input, options);
  ssml = styleTemplate(ssml, options);
  ssml = voiceTemplate(ssml, options);
  ssml = speackTemplate(ssml);
  return ssml;
};