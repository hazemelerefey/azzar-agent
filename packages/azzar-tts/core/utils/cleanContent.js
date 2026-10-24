import _regeneratorRuntime from "@babel/runtime/helpers/esm/regeneratorRuntime";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

// @ts-ignore
var convertMarkdownToMdast = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(md) {
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          return _context.abrupt("return", unified().use(remarkParse).use(remarkGfm).parse(md.trim()));
        case 1:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return function convertMarkdownToMdast(_x) {
    return _ref.apply(this, arguments);
  };
}();
export var cleanContent = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(content) {
    var mdast, newContent;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return convertMarkdownToMdast(content.trim());
        case 3:
          mdast = _context2.sent;
          newContent = [];
          visit(mdast, 'text', function (node) {
            if (node !== null && node !== void 0 && node.value) newContent.push(node.value.trim());
          });
          return _context2.abrupt("return", newContent.join(''));
        case 9:
          _context2.prev = 9;
          _context2.t0 = _context2["catch"](0);
          return _context2.abrupt("return", content.trim());
        case 12:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 9]]);
  }));
  return function cleanContent(_x2) {
    return _ref2.apply(this, arguments);
  };
}();