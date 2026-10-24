import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
export var genSendContent = function genSendContent(header, data) {
  var content = [];
  for (var _i = 0, _Object$entries = Object.entries(header); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
      _key = _Object$entries$_i[0],
      value = _Object$entries$_i[1];
    content.push("".concat(_key, ":").concat(value));
  }
  content.push('', data);
  return content.join('\r\n');
};