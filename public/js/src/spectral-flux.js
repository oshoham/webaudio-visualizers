/**
 * Implementation of the Spectral Flux onset detection method
 * described in "Simple Spectrum-Based Onset Detection" (http://www.music-ir.org/evaluation/MIREX/2006_abstracts/OD_dixon.pdf)
 */

import {
  AudioContext,
  Worker,
  requestAnimationFrame,
  loadAudio,
  resizeCanvas
} from './utils';

/* Functions */

function playSound (sourceNode) {
  sourceNode.start(0);
}

function setupAudioNodes (context, { stftData, spectralFluxData, standardizedSpectralFluxData }) {
  var sourceNode = context.createBufferSource();
  var spectralFluxProcessor = context.createScriptProcessor(512, 1, 1);

  spectralFluxProcessor.onaudioprocess = function (audioProcessingEvent) {
    var playbackTime = audioProcessingEvent.playbackTime;
    // preprocessedDataBin = playbackTime * 44100 (sample rate) / 441 (STFT hop size)
    var preprocessedDataBin = Math.floor(playbackTime * 100);
    console.log(standardizedSpectralFluxData[preprocessedDataBin]);
  };

  sourceNode.connect(spectralFluxProcessor);
  spectralFluxProcessor.connect(context.destination);

  return {
    sourceNode: sourceNode,
    analyserNode: spectralFluxProcessor
  };
}

function visualize () {
  // audio context variables
  var context = new AudioContext();

  // canvas variables
  var canvas = document.getElementById('canvas');
  var canvasCtx = canvas.getContext('2d');

  resizeCanvas(canvas);
  var width = canvas.width;
  var height = canvas.height;

  canvasCtx.clearRect(0, 0, width, height);

  canvasCtx.fillStyle = 'rgb(0, 0, 0)';
  canvasCtx.fillRect(0, 0, width, height);

  var stftWorker = new Worker('js/workers/stft-worker.js');

  loadAudio(context, 'sounds/flim.mp3').then(function (audioBuffer) {
    let audioBufferData = audioBuffer.getChannelData(0).slice();

    stftWorker.onmessage = function (e) {
      let nodes = setupAudioNodes(context, e.data);
      nodes.sourceNode.buffer = audioBuffer;
      playSound(nodes.sourceNode);
    };

    stftWorker.postMessage(audioBufferData, [audioBufferData.buffer]);
  });
}

visualize();
