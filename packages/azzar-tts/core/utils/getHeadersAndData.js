import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import _createForOfIteratorHelper from "@babel/runtime/helpers/esm/createForOfIteratorHelper";
export var getHeadersAndData = function getHeadersAndData(data) {
  var headers = {};
  var _iterator = _createForOfIteratorHelper(data.slice(0, data.indexOf('\r\n\r\n')).split('\r\n')),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var line = _step.value;
      var _line$split = line.split(':', 2),
        _line$split2 = _slicedToArray(_line$split, 2),
        _key = _line$split2[0],
        value = _line$split2[1];
      headers[_key] = value;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return {
    data: data.slice(data.indexOf('\r\n\r\n') + 4),
    headers: headers
  };
};