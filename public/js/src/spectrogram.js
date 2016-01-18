import { AudioContext, requestAnimationFrame } from './utils';
import chroma from 'chroma-js';

/* Functions */

function resizeCanvas (canvas) {
  var displayWidth  = canvas.clientWidth;
  var displayHeight = canvas.clientHeight;

  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    canvas.width  = displayWidth;
    canvas.height = displayHeight;
  }
}

function loadAudio (context, sourceNode, url) {
  var request = new XMLHttpRequest();

  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  request.onload = function () {
    context.decodeAudioData(
      request.response,
      function (buffer) { sourceNode.buffer = buffer; },
      function (error) { console.log(error); }
    );
  };
  request.send();
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
  analyserNode.fftSize = 1024;

  sourceNode.connect(analyserNode);

  return {
    sourceNode: sourceNode,
    analyserNode: analyserNode
  };
}

function visualize () {
  // audio context variables
  var context = new AudioContext();
  var nodes = setupAudioNodes(context);
  var bufferLength = nodes.analyserNode.frequencyBinCount;
  var frequencyArray = new Uint8Array(bufferLength);

  // canvas variables
  var canvas = document.getElementById('canvas');
  var canvasCtx = canvas.getContext('2d');

  resizeCanvas(canvas);
  var width = canvas.width;
  var height = canvas.height;

  var tempCanvas = document.createElement('canvas');
  var tempCanvasCtx = tempCanvas.getContext('2d');
  tempCanvas.width = width;
  tempCanvas.height = height;

  canvasCtx.clearRect(0, 0, width, height);

  canvasCtx.fillStyle = 'rgb(0, 0, 0)';
  canvasCtx.fillRect(0, 0, width, height);

  var cellHeight = bufferLength / height;

  // make a color scale
  var scale = chroma.scale(['#000000', '#ff0000', '#ffff00', '#ffffff']).domain([0, 255]).mode('rgb');

  function draw () {
    canvas = document.getElementById('canvas');
    resizeCanvas(canvas);
    width = tempCanvas.width = canvas.width;
    height = tempCanvas.height = canvas.height;

    tempCanvasCtx.drawImage(canvas, 0, 0, width, height);

    nodes.analyserNode.getByteFrequencyData(frequencyArray);

    frequencyArray.forEach(function (frequency, i) {
      canvasCtx.fillStyle = scale(frequency).hex();
      canvasCtx.fillRect(width - 1, height - i, 1, cellHeight);
    });

    canvasCtx.translate(-1, 0);

    canvasCtx.drawImage(tempCanvas, 0, 0, width, height, 0, 0, width, height);

    canvasCtx.translate(1, 0);

    requestAnimationFrame(draw);
  }

  loadAudio(context, nodes.sourceNode, 'sounds/sunday_candy.mp3');
  playSound(nodes.sourceNode);
  draw();
}

visualize();

