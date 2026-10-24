import _regeneratorRuntime from "@babel/runtime/helpers/esm/regeneratorRuntime";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import qs from 'query-string';
import { v4 as uuidv4 } from 'uuid';
import { genSSML } from "../utils/genSSML";
import { genSendContent } from "../utils/genSendContent";
import { getHeadersAndData } from "../utils/getHeadersAndData";
var EDGE_SPEECH_URL = 'wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1';
var EDGE_API_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';
var configContent = JSON.stringify({
  context: {
    synthesis: {
      audio: {
        metadataoptions: {
          sentenceBoundaryEnabled: false,
          wordBoundaryEnabled: true
        },
        outputFormat: 'audio-24khz-48kbitrate-mono-mp3'
      }
    }
  }
});
var genHeader = function genHeader(connectId) {
  var date = new Date().toString();
  var configHeader = {
    'Content-Type': 'application/json; charset=utf-8',
    'Path': 'speech.config',
    'X-Timestamp': date
  };
  var contentHeader = {
    'Content-Type': 'application/ssml+xml',
    'Path': 'ssml',
    'X-RequestId': connectId,
    'X-Timestamp': date
  };
  return {
    configHeader: configHeader,
    contentHeader: contentHeader
  };
};
export var createEdgeSpeech = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(_ref) {
    var payload,
      _ref3,
      proxyUrl,
      token,
      input,
      options,
      connectId,
      url,
      _genHeader,
      configHeader,
      contentHeader,
      config,
      content,
      _args2 = arguments;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          payload = _ref.payload;
          _ref3 = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : {}, proxyUrl = _ref3.proxyUrl, token = _ref3.token;
          input = payload.input, options = payload.options;
          connectId = uuidv4().replaceAll('-', '');
          url = qs.stringifyUrl({
            query: {
              ConnectionId: connectId,
              TrustedClientToken: token ? token : EDGE_API_TOKEN
            },
            url: proxyUrl ? proxyUrl : EDGE_SPEECH_URL
          });
          _genHeader = genHeader(connectId), configHeader = _genHeader.configHeader, contentHeader = _genHeader.contentHeader;
          config = genSendContent(configHeader, configContent);
          content = genSendContent(contentHeader, genSSML(input, options));
          return _context2.abrupt("return", new Promise(function (resolve, reject) {
            var ws = new WebSocket(url);
            ws.binaryType = 'arraybuffer';
            var onOpen = function onOpen() {
              ws.send(config);
              ws.send(content);
            };
            var audioData = new ArrayBuffer(0);
            var onMessage = /*#__PURE__*/function () {
              var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(event) {
                var _getHeadersAndData, headers, res, dataview, headerLength, newBody, newAudioData, mergedUint8Array;
                return _regeneratorRuntime().wrap(function _callee$(_context) {
                  while (1) switch (_context.prev = _context.next) {
                    case 0:
                      if (!(typeof event.data === 'string')) {
                        _context.next = 13;
                        break;
                      }
                      _getHeadersAndData = getHeadersAndData(event.data), headers = _getHeadersAndData.headers;
                      _context.t0 = headers['Path'];
                      _context.next = _context.t0 === 'turn.end' ? 5 : 11;
                      break;
                    case 5:
                      ws.close();
                      if (audioData.byteLength) {
                        _context.next = 8;
                        break;
                      }
                      return _context.abrupt("return");
                    case 8:
                      res = new Response(audioData);
                      resolve(res);
                      return _context.abrupt("break", 11);
                    case 11:
                      _context.next = 14;
                      break;
                    case 13:
                      if (event.data instanceof ArrayBuffer) {
                        dataview = new DataView(event.data);
                        headerLength = dataview.getInt16(0);
                        if (event.data.byteLength > headerLength + 2) {
                          newBody = event.data.slice(2 + headerLength);
                          newAudioData = new ArrayBuffer(audioData.byteLength + newBody.byteLength);
                          mergedUint8Array = new Uint8Array(newAudioData);
                          mergedUint8Array.set(new Uint8Array(audioData), 0);
                          mergedUint8Array.set(new Uint8Array(newBody), audioData.byteLength);
                          audioData = newAudioData;
                        }
                      }
                    case 14:
                    case "end":
                      return _context.stop();
                  }
                }, _callee);
              }));
              return function onMessage(_x2) {
                return _ref4.apply(this, arguments);
              };
            }();
            var onError = function onError() {
              reject(new Error('WebSocket error occurred.'));
              ws.close();
            };
            ws.addEventListener('open', onOpen);
            ws.addEventListener('message', onMessage);
            ws.addEventListener('error', onError);
          }));
        case 9:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return function createEdgeSpeech(_x) {
    return _ref2.apply(this, arguments);
  };
}();