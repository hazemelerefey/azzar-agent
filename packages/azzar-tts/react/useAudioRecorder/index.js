import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import { useCallback, useState } from 'react';
import { getRecordMineType } from "../../core/utils/getRecordMineType";
import { secondsToMinutesAndSeconds } from "../../core/utils/secondsToMinutesAndSeconds";
export var useAudioRecorder = function useAudioRecorder(onBlobAvailable) {
  var _useState = useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    isRecording = _useState2[0],
    setIsRecording = _useState2[1];
  var _useState3 = useState(0),
    _useState4 = _slicedToArray(_useState3, 2),
    time = _useState4[0],
    setTime = _useState4[1];
  var _useState5 = useState(),
    _useState6 = _slicedToArray(_useState5, 2),
    mediaRecorder = _useState6[0],
    setMediaRecorder = _useState6[1];
  var _useState7 = useState(),
    _useState8 = _slicedToArray(_useState7, 2),
    timerInterval = _useState8[0],
    setTimerInterval = _useState8[1];
  var _useState9 = useState(),
    _useState10 = _slicedToArray(_useState9, 2),
    blob = _useState10[0],
    setBlob = _useState10[1];
  var _useState11 = useState(),
    _useState12 = _slicedToArray(_useState11, 2),
    url = _useState12[0],
    setUrl = _useState12[1];
  var _startTimer = useCallback(function () {
    var interval = setInterval(function () {
      setTime(function (time) {
        return time + 1;
      });
    }, 1000);
    setTimerInterval(interval);
  }, []);
  var _stopTimer = useCallback(function () {
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    timerInterval !== undefined && clearInterval(timerInterval);
    // @ts-ignore
    setTimerInterval();
  }, [timerInterval]);
  var start = useCallback(function () {
    if (url) URL.revokeObjectURL(url);
    setUrl(undefined);
    setBlob(undefined);
    if (timerInterval !== undefined) return;
    navigator.mediaDevices.getUserMedia({
      audio: true
    }).then(function (stream) {
      setIsRecording(true);
      var recorder = new MediaRecorder(stream, {
        mimeType: getRecordMineType().mineType
      });
      setMediaRecorder(recorder);
      recorder.start();
      _startTimer();
      recorder.addEventListener('dataavailable', function (event) {
        var blobData = event.data;
        setBlob(blobData);
        setUrl(URL.createObjectURL(blobData));
        onBlobAvailable === null || onBlobAvailable === void 0 || onBlobAvailable(event.data);
        recorder.stream.getTracks().forEach(function (t) {
          return t.stop();
        });
        // @ts-ignore
        setMediaRecorder();
      });
    }).catch(function (error) {
      console.error('Error useAudioRecorder', error);
    });
  }, [timerInterval, _startTimer, url]);
  var stop = useCallback(function () {
    mediaRecorder === null || mediaRecorder === void 0 || mediaRecorder.stop();
    _stopTimer();
    setTime(0);
    setIsRecording(false);
  }, [mediaRecorder, _stopTimer]);
  return {
    blob: blob,
    formattedTime: secondsToMinutesAndSeconds(time),
    isRecording: isRecording,
    mediaRecorder: mediaRecorder,
    start: start,
    stop: stop,
    time: time,
    url: url
  };
};