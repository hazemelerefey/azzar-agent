export var genLevaOptions = function genLevaOptions(options) {
  var data = {};
  options === null || options === void 0 || options.forEach(function (item) {
    return data[(item === null || item === void 0 ? void 0 : item.label) || (item === null || item === void 0 ? void 0 : item.value)] = item === null || item === void 0 ? void 0 : item.value;
  });
  return data;
};