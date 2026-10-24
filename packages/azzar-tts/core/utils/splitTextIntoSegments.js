var toHalfWidthAndCleanSpace = function toHalfWidthAndCleanSpace(str) {
  return str.replaceAll(/[\uFF01-\uFF5E]/g, function (ch) {
    return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0);
  }).replaceAll("\u3000", ' ').replaceAll('。', '.').replaceAll('，', ',').replaceAll('！', '!').replaceAll('？', '?').replaceAll('；', ';').replaceAll('：', ':').replaceAll('（', '(').replaceAll('）', ')').replaceAll('【', '[').replaceAll('】', ']').replaceAll('《', '<').replaceAll('》', '>').replaceAll('“', '"').replaceAll('”', '"').replaceAll('‘', "'").replaceAll('’', "'").replaceAll('\n', '. ').replaceAll(/\s+/g, ' ');
};
export var splitTextIntoSegments = function splitTextIntoSegments(text) {
  var maxChars = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
  text = toHalfWidthAndCleanSpace(text);
  var sentences = text.match(/[^!.;?]+[!.;?]+/g) || [];
  var segments = [];
  var currentSegment = '';
  sentences.forEach(function (sentence) {
    if ((currentSegment + sentence).length > maxChars) {
      if (currentSegment.length > 0) {
        segments.push(currentSegment.trim());
        currentSegment = '';
      }
      if (sentence.length > maxChars) {
        segments.push(sentence.trim());
      } else {
        currentSegment = sentence;
      }
    } else {
      currentSegment += sentence;
    }
  });
  if (currentSegment.length > 0) {
    segments.push(currentSegment.trim());
  }
  return segments.filter(Boolean);
};