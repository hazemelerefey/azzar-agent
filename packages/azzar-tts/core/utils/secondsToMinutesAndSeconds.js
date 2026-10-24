export var secondsToMinutesAndSeconds = function secondsToMinutesAndSeconds(seconds) {
  if (seconds < 0) return "--:--";
  var minutes = Math.floor(seconds / 60);
  var remainingSeconds = Math.floor(seconds % 60);
  var minutesStr = minutes.toString().padStart(2, '0');
  var secondsStr = remainingSeconds.toString().padStart(2, '0');
  return "".concat(minutesStr, ":").concat(secondsStr);
};