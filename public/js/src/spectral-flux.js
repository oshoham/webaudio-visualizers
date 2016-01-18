/**
 * Implementation of the Spectral Flux onset detection method
 * described in "Simple Spectrum-Based Onset Detection" (http://www.music-ir.org/evaluation/MIREX/2006_abstracts/OD_dixon.pdf)
 */

import { AudioContext, OfflineAudioContext, requestAnimationFrame } from './utils';
import stft from './stft';

/* Functions */

function resizeCanvas (canvas) {
  var displayWidth  = canvas.clientWidth;
  var displayHeight = canvas.clientHeight;

  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    canvas.width  = displayWidth;
    canvas.height = displayHeight;
  }
}

function loadAudio (context, url) {
  return new Promise(function (resolve, reject) {
    var request = new XMLHttpRequest();

    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = function () {
      context.decodeAudioData(
        request.response,
        function (buffer) { resolve(buffer); },
        function (error) { reject(error); }
      );
    };

    request.onerror = function () {
      reject(Error("Network Error"));
    };

    request.send();
  });
}

function playSound (sourceNode) {
  sourceNode.start(0);
}

function setupAudioNodes (context) {
  /**
   * context.destination is a special node that is associated
   * with the default audio output of your system
   */
  var sourceNode = context.createBufferSource();
  sourceNode.connect(context.destination);

  var analyserNode = context.createAnalyser();
  analyserNode.fftSize = 2048;
  analyserNode.smoothingTimeConstant = 0.785;

  sourceNode.connect(analyserNode);

  return {
    sourceNode: sourceNode,
    analyserNode: analyserNode
  };
}

function halfWaveRectifier (x) {
  return (x + Math.abs(x)) / 2;
}

function spectralFlux (frequencyMatrix) {
}

function visualize () {
  // audio context variables
  var context = new AudioContext();
  var nodes = setupAudioNodes(context);

  // canvas variables
  var canvas = document.getElementById('canvas');
  var canvasCtx = canvas.getContext('2d');

  resizeCanvas(canvas);
  var width = canvas.width;
  var height = canvas.height;

  canvasCtx.clearRect(0, 0, width, height);

  canvasCtx.fillStyle = 'rgb(0, 0, 0)';
  canvasCtx.fillRect(0, 0, width, height);

  loadAudio(context, 'sounds/flim.mp3').then(function (buffer) {
    stft(buffer).then(function (stftData) {
      debugger;
      nodes.sourceNode.buffer = buffer;
      playSound(nodes.sourceNode);
    });
  });
}

visualize();

