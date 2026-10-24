var voiceList = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
export default voiceList;
export var getOpenaiVoiceOptions = function getOpenaiVoiceOptions() {
  return voiceList.map(function (voice) {
    return {
      label: voice,
      value: voice
    };
  });
};