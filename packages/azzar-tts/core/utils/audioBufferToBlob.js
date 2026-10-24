import _regeneratorRuntime from "@babel/runtime/helpers/esm/regeneratorRuntime";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
var audioBufferToWav = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(buffer) {
    var numOfChan, length, bufferOut, view, channels, sample, offset, pos, setUint16, setUint32, i, _i;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          numOfChan = buffer.numberOfChannels;
          length = buffer.length * numOfChan * 2 + 44;
          bufferOut = new ArrayBuffer(length);
          view = new DataView(bufferOut);
          channels = [];
          offset = 0;
          pos = 0;
          setUint16 = function setUint16(data) {
            view.setUint16(pos, data, true);
            pos += 2;
          };
          setUint32 = function setUint32(data) {
            view.setUint32(pos, data, true);
            pos += 4;
          }; // 写入 WAV 头部信息
          setUint32(0x46464952); // "RIFF"
          setUint32(length - 8); // 文件长度 - 8
          setUint32(0x45564157); // "WAVE"

          // 写入 fmt 子块
          setUint32(0x20746D66); // "fmt " 字符串
          setUint32(16); // 子块的大小（16对于PCM格式是固定的）
          setUint16(1); // 音频格式（1表示PCM - 线性量化）
          setUint16(numOfChan);
          setUint32(buffer.sampleRate);
          setUint32(buffer.sampleRate * 2 * numOfChan); // 字节率
          setUint16(numOfChan * 2); // 块对齐
          setUint16(16); // 比特数（对于PCM格式这意味着位深）

          // 写入 data 子块
          setUint32(0x61746164); // "data" 字符串
          setUint32(length - pos - 4); // 子块的大小（即实际音频数据的大小）

          // 函数用于以小端序写入数值

          // 分别写入每个通道的音频数据
          for (i = 0; i < buffer.numberOfChannels; i++) {
            channels.push(buffer.getChannelData(i));
          }

          // 写入交错的音频数据
          while (offset < buffer.length) {
            for (_i = 0; _i < numOfChan; _i++) {
              sample = Math.max(-1, Math.min(1, channels[_i][offset])); // 音频剪切
              sample = Math.trunc(0.5 + sample < 0 ? sample * 32768 : sample * 32767); // 转换为 16 位
              view.setInt16(pos, sample, true);
              pos += 2;
            }
            offset++;
          }
          return _context.abrupt("return", bufferOut);
        case 25:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return function audioBufferToWav(_x) {
    return _ref.apply(this, arguments);
  };
}();
export var audioBufferToBlob = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(audioBuffer) {
    var wavArrayBuffer;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return audioBufferToWav(audioBuffer);
        case 2:
          wavArrayBuffer = _context2.sent;
          return _context2.abrupt("return", new Blob([wavArrayBuffer], {
            type: 'audio/wav'
          }));
        case 4:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return function audioBufferToBlob(_x2) {
    return _ref2.apply(this, arguments);
  };
}();
export var mergeAudioBuffers = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(audioBuffers) {
    var audioContext, totalLength, outputBuffer, offset;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          audioContext = new AudioContext(); // 计算所有AudioBuffer的总长度
          totalLength = audioBuffers.reduce(function (acc, curr) {
            return acc + curr.length;
          }, 0); // 创建一个新的AudioBuffer
          outputBuffer = audioContext.createBuffer(audioBuffers[0].numberOfChannels, totalLength, audioBuffers[0].sampleRate); // 用于追踪新AudioBuffer的当前位置
          offset = 0; // 遍历AudioBuffers数组，并将它们依次拷贝到新的AudioBuffer中
          audioBuffers.forEach(function (buffer) {
            // 对于每个通道
            for (var i = 0; i < buffer.numberOfChannels; i++) {
              // 获取当前AudioBuffer的通道数据
              var inputData = buffer.getChannelData(i);
              // 获取输出AudioBuffer的通道数据
              var outputData = outputBuffer.getChannelData(i);
              // 将当前AudioBuffer的数据拷贝到输出AudioBuffer的正确位置
              outputData.set(inputData, offset);
            }
            // 更新偏移量
            offset += buffer.length;
          });
          return _context3.abrupt("return", outputBuffer);
        case 6:
        case "end":
          return _context3.stop();
      }
    }, _callee3);
  }));
  return function mergeAudioBuffers(_x3) {
    return _ref3.apply(this, arguments);
  };
}();