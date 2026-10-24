export var getRecordMineType = function getRecordMineType() {
  try {
    return MediaRecorder.isTypeSupported('audio/webm') ? {
      extension: 'webm',
      mineType: 'audio/webm'
    } : {
      extension: 'mp4',
      mineType: 'audio/mp4'
    };
  } catch (_unused) {
    return {
      extension: 'webm',
      mineType: 'audio/webm'
    };
  }
};