export var playAudioBlob = function playAudioBlob(blob) {
  var url = URL.createObjectURL(blob);
  var audio = new Audio(url);
  return {
    audio: audio,
    url: url
  };
};