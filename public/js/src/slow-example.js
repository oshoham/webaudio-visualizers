/**
 * Implementation of the Spectral Flux onset detection method
 * described in "Simple Spectrum-Based Onset Detection" (http://www.music-ir.org/evaluation/MIREX/2006_abstracts/OD_dixon.pdf)
 */

import twgl from 'twgl.js';
import {
  AudioContext,
  Worker,
  requestAnimationFrame,
  loadAudio,
  resizeCanvas
} from './utils';

var glslify = require('glslify');

var isOnset = false;

function lowPassFilter (n, alpha, data) {
  var acc = 0.0;
  for (var i = 0; i <= n; i++) {
    acc = Math.max(data[n], alpha * acc + (1.0 - alpha) * data[n]);
  }
  return acc;
}

function detectOnset (n, data, options = {}) {
  var w = options.w || 3;
  var m = options.m || 3;
  var delta = options.delta || 0.5;
  var alpha = options.alpha || 0.5;

  var length = data.length;
  var value = data[n];
  var k;

  var greaterThanSurroundingValues = true;
  for (k = n - w; k <= n + w; k++) {
    greaterThanSurroundingValues = greaterThanSurroundingValues && value >= data[Math.max(0, Math.min(k, length - 1))];
  }

  var sumOfLocalValues = 0.0;
  for (k = n - m * w; k <= n + w; k++) {
    if (k >= 0 && k < length) {
      sumOfLocalValues += data[k];
    }
  }
  var aboveLocalMeanThreshold = value >= ((sumOfLocalValues / (m * w + w + 1)) + delta);

  var aboveLowPassFilter = value >= lowPassFilter(n - 1, alpha, data);

  return greaterThanSurroundingValues && aboveLocalMeanThreshold && aboveLowPassFilter;
}

function setupAudioNodes (context, { stftData, spectralFluxData, normalizedSpectralFluxData }) {
  var sourceNode = context.createBufferSource();
  var onsetDetectorNode = context.createScriptProcessor(512, 1, 1);

  onsetDetectorNode.onaudioprocess = function (audioProcessingEvent) {
    var playbackTime = audioProcessingEvent.playbackTime;
    // preprocessedDataBin = playbackTime * 44100 (sample rate) / 441 (STFT hop size)
    var spectralFluxDataBin = Math.floor(playbackTime * 100);
    isOnset = detectOnset(spectralFluxDataBin, normalizedSpectralFluxData);

    if (isOnset) {
      console.log(`onset at: ${playbackTime}`);
    }

    var inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
    var outputData = audioProcessingEvent.outputBuffer.getChannelData(0);

    // pass audio data through to destination
    for (var sample = 0; sample < audioProcessingEvent.inputBuffer.length; sample++) {
      outputData[sample] = inputData[sample];
    }
  };

  sourceNode.onended = function () {
    sourceNode.disconnect(onsetDetectorNode);
    onsetDetectorNode.disconnect(context.destination);
  };

  //sourceNode.connect(context.destination);
  sourceNode.connect(onsetDetectorNode);
  onsetDetectorNode.connect(context.destination);

  return {
    sourceNode: sourceNode,
    onsetDetectorNode: onsetDetectorNode
  };
}

function visualize () {
  var context = new AudioContext();
  var stftWorker = new Worker('js/workers/stft-worker.js');

  loadAudio(context, 'sounds/flim.mp3').then(function (audioBuffer) {
    let audioBufferData = audioBuffer.getChannelData(0).slice();

    stftWorker.onmessage = function (e) {
      let nodes = setupAudioNodes(context, e.data);
      nodes.sourceNode.buffer = audioBuffer;
      nodes.sourceNode.start(0);
    };

    stftWorker.postMessage(audioBufferData, [audioBufferData.buffer]);
  });
}

visualize();
