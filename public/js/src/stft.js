import { OfflineAudioContext } from './utils';

export default function stft (buffer, options = {}) {
  var numOfChannels = options.numOfChannels || 1;
  var sampleRate = options.sampleRate || 44100;
  var offlineContext = new OfflineAudioContext(numOfChannels, buffer.length, sampleRate);

  var stftData = [];

  var source = offlineContext.createBufferSource();
  source.buffer = buffer;

  var analyser = offlineContext.createAnalyser();
  analyser.fftSize = options.fftSize || 2048;
  analyser.smoothingTimeConstant = options.smoothingTimeConstant || 0.785;

  var stftProcessor = offlineContext.createScriptProcessor(analyser.frequencyBinCount, 1, 1);

  stftProcessor.onaudioprocess = () => {
    let fftData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(fftData);
    stftData.push(fftData);
  };

  source.connect(analyser);
  analyser.connect(stftProcessor);
  stftProcessor.connect(offlineContext.destination);

  source.start(0);

  return offlineContext.startRendering().then(() => {
    debugger;
    return stftData;
  });
}
