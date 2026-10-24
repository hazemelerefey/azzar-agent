import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["audioRef", "count", "width", "color"];
import { useTheme } from 'antd-style';
import { memo } from 'react';
import { useAudioVisualizer } from "../hooks/useAudioVisualizer";
import { jsx as _jsx } from "react/jsx-runtime";
var Visualizer = /*#__PURE__*/memo(function (_ref) {
  var audioRef = _ref.audioRef,
    _ref$count = _ref.count,
    count = _ref$count === void 0 ? 4 : _ref$count,
    _ref$width = _ref.width,
    width = _ref$width === void 0 ? 48 : _ref$width,
    color = _ref.color,
    barStyle = _objectWithoutProperties(_ref, _excluded);
  var maxHeight = (barStyle === null || barStyle === void 0 ? void 0 : barStyle.maxHeight) || width * 3;
  var minHeight = (barStyle === null || barStyle === void 0 ? void 0 : barStyle.minHeight) || width;
  var borderRadius = (barStyle === null || barStyle === void 0 ? void 0 : barStyle.borderRadius) || width / 2;
  var theme = useTheme();
  var bars = useAudioVisualizer(audioRef, {
    count: count
  });
  return bars.map(function (bar, index) {
    return /*#__PURE__*/_jsx("div", {
      style: {
        background: color || theme.colorPrimary,
        borderRadius: borderRadius,
        height: minHeight + bar / 255 * (maxHeight - minHeight),
        transition: 'height 50ms cubic-bezier(.2,-0.5,.8,1.5)',
        width: width
      }
    }, index);
  });
});
export default Visualizer;