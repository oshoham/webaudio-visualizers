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
var alpha = document.getElementById('alpha').value;
var delta = document.getElementById('delta').value;
debugger;

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
  var delta = options.delta || 0.35;
  var alpha = options.alpha || 0.84;

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
    var alpha = document.getElementById('alpha').value;
    var delta = document.getElementById('delta').value;
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

  sourceNode.connect(onsetDetectorNode);
  onsetDetectorNode.connect(context.destination);

  return {
    sourceNode: sourceNode,
    onsetDetectorNode: onsetDetectorNode
  };
}

function visualize () {
  var canvas = document.getElementById('canvas');
  var canvasCtx = canvas.getContext('2d');

  function draw (time) {
    twgl.resizeCanvasToDisplaySize(canvas);
    var width = canvas.width;
    var height = canvas.height;

    alpha = document.getElementById('alpha').value || 0.5;
    delta = document.getElementById('delta').value || 0;

    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, width, height);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    canvasCtx.beginPath();

    var x = width / 2;
    var y = height / 2;
    var radius = height / 3;
    var frequency = 10;
    var amp = 0.1 * time;
    var angle, dx, dy;

    var waveAmplitude = 0.03;
    var waveFrequency = 50;
    var rotationSpeed = 0.05;
    var oscillationSpeed = 0.005;

    for (angle = 0; angle <= 2 * Math.PI; angle += 0.001) {
      dx = x + radius * Math.cos(angle) * (1.0 + waveAmplitude * Math.sin(angle * waveFrequency + rotationSpeed * time) * Math.sin(oscillationSpeed * time));
      dy = y + radius * Math.sin(angle) * (1.0 + waveAmplitude * Math.sin(angle * waveFrequency + rotationSpeed * time) * Math.sin(oscillationSpeed * time));

      if (angle === 0) {
        canvasCtx.moveTo(dx, dy);
      } else {
        canvasCtx.lineTo(dx, dy);
      }
    }

    canvasCtx.stroke();

    requestAnimationFrame(draw);
  }

  var context = new AudioContext();
  var stftWorker = new Worker('js/workers/stft-worker.js');

  loadAudio(context, 'sounds/flim.mp3').then(function (audioBuffer) {
    let audioBufferData = audioBuffer.getChannelData(0).slice();

    stftWorker.onmessage = function (e) {
      let nodes = setupAudioNodes(context, e.data);
      nodes.sourceNode.buffer = audioBuffer;
      nodes.sourceNode.start(0);
      requestAnimationFrame(draw);
    };

    stftWorker.postMessage(audioBufferData, [audioBufferData.buffer]);
  });
}

visualize();
