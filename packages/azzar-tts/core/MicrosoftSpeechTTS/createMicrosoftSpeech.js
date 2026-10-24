import _regeneratorRuntime from "@babel/runtime/helpers/esm/regeneratorRuntime";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import { v4 as uuidv4 } from 'uuid';
import { genSSML } from "../utils/genSSML";
var MICROSOFT_SPEECH_URL = 'https://southeastasia.api.speech.microsoft.com/accfreetrial/texttospeech/acc/v3.0-beta1/vcg/speak';
export var createMicrosoftSpeech = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(_ref) {
    var payload,
      _ref3,
      proxyUrl,
      input,
      options,
      DEFAULT_HEADERS,
      body,
      _args = arguments;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          payload = _ref.payload;
          _ref3 = _args.length > 1 && _args[1] !== undefined ? _args[1] : {}, proxyUrl = _ref3.proxyUrl;
          input = payload.input, options = payload.options;
          DEFAULT_HEADERS = new Headers({
            'accept': '*/*',
            'accept-language': 'zh-CN,zh;q=0.9',
            'authority': 'southeastasia.api.speech.microsoft.com',
            'content-type': 'application/json',
            'customvoiceconnectionid': uuidv4(),
            'origin': 'https://speech.microsoft.com',
            'sec-ch-ua': '"Google Chrome";v="111", "Not(A:Brand";v="8", "Chromium";v="111"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
          });
          body = JSON.stringify({
            offsetInPlainText: 0,
            properties: {
              SpeakTriggerSource: 'AccTuningPagePlayButton'
            },
            ssml: genSSML(input, options),
            ttsAudioFormat: 'audio-24khz-160kbitrate-mono-mp3'
          });
          return _context.abrupt("return", fetch(proxyUrl ? proxyUrl : MICROSOFT_SPEECH_URL, {
            body: body,
            // @ts-ignore
            duplex: 'half',
            headers: DEFAULT_HEADERS,
            method: 'POST',
            responseType: 'arraybuffer'
          }));
        case 6:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return function createMicrosoftSpeech(_x) {
    return _ref2.apply(this, arguments);
  };
}();