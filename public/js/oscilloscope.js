window.AudioContext = window.AudioContext || (function () {
  return  window.webkitAudioContext ||
          window.mozAudioContext ||
          window.oAudioContext ||
          window.msAudioContext;
})();

window.requestAnimationFrame = window.requestAnimationFrame || (function () {
  return  window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.oRequestAnimationFrame ||
          window.msRequestAnimationFrame ||
          function (callback) {
            window.setTimeout( callback, 1000 / 60 );
          };
})();

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
  analyserNode.smoothingTimeConstant = 0.3;
  analyserNode.fftSize = 2048;

  var javascriptNode = context.createScriptProcessor(2048, 1, 1);
  javascriptNode.connect(context.destination);

  sourceNode.connect(analyserNode);
  analyserNode.connect(javascriptNode);

  return {
    sourceNode: sourceNode,
    analyserNode: analyserNode,
    javascriptNode: javascriptNode
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

  canvasCtx.clearRect(0, 0, width, height);

  function draw () {
    resizeCanvas(canvas);
    width = canvas.width;
    height = canvas.height;

    nodes.analyserNode.getByteTimeDomainData(frequencyArray);

    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, width, height);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    canvasCtx.beginPath();

    var sliceWidth = width * 1.0 / bufferLength;
    var x = 0;

    frequencyArray.forEach(function (frequency, i) {
      var y = (frequency / 128.0) * (height / 2);

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    });

    canvasCtx.lineTo(width, height / 2);
    canvasCtx.stroke();

    window.requestAnimationFrame(draw);
  }

  loadAudio(context, nodes.sourceNode, 'sounds/sunday_candy.mp3');
  playSound(nodes.sourceNode);
  draw();
}

visualize();

