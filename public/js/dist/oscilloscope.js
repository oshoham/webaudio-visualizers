(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _utils = require('./utils');

/* Functions */

function resizeCanvas(canvas) {
  var displayWidth = canvas.clientWidth;
  var displayHeight = canvas.clientHeight;

  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }
}

function loadAudio(context, sourceNode, url) {
  var request = new XMLHttpRequest();

  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  request.onload = function () {
    context.decodeAudioData(request.response, function (buffer) {
      sourceNode.buffer = buffer;
    }, function (error) {
      console.log(error);
    });
  };
  request.send();
}

function playSound(sourceNode) {
  sourceNode.start(0);
}

function setupAudioNodes(context) {
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

function visualize() {
  // audio context variables
  var context = new _utils.AudioContext();
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

  function draw() {
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
      var y = frequency / 128.0 * (height / 2);

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    });

    canvasCtx.lineTo(width, height / 2);
    canvasCtx.stroke();

    (0, _utils.requestAnimationFrame)(draw);
  }

  loadAudio(context, nodes.sourceNode, 'sounds/sunday_candy.mp3');
  playSound(nodes.sourceNode);
  draw();
}

visualize();

},{"./utils":2}],2:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var requestAnimationFrame = global.requestAnimationFrame || function () {
  return global.webkitRequestAnimationFrame || global.mozRequestAnimationFrame || global.oRequestAnimationFrame || global.msRequestAnimationFrame || function (callback) {
    global.setTimeout(callback, 1000 / 60);
  };
}();

var AudioContext = global.AudioContext || global.webkitAudioContext;
var OfflineAudioContext = global.OfflineAudioContext || global.webkitOfflineAudioContext;
var Worker = global.Worker || global.webkitWorker;

function loadAudio(audioContext, url) {
  return new Promise(function (resolve, reject) {
    var request = new XMLHttpRequest();

    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    var onDecodeSuccess = function onDecodeSuccess(buffer) {
      resolve(buffer);
    };
    var onDecodeFailure = function onDecodeFailure(error) {
      reject(error);
    };

    request.onload = function () {
      audioContext.decodeAudioData(request.response, onDecodeSuccess, onDecodeFailure);
    };

    request.onerror = function () {
      reject(Error('Network Error'));
    };

    request.send();
  });
}

function resizeCanvas(canvas) {
  var displayWidth = canvas.clientWidth;
  var displayHeight = canvas.clientHeight;

  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }
}

exports.AudioContext = AudioContext;
exports.OfflineAudioContext = OfflineAudioContext;
exports.Worker = Worker;
exports.requestAnimationFrame = requestAnimationFrame;
exports.loadAudio = loadAudio;
exports.resizeCanvas = resizeCanvas;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvb3NjaWxsb3Njb3BlLmpzIiwic3JjL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FDSUEsU0FBUyxZQUFZLENBQUUsTUFBTSxFQUFFO0FBQzdCLE1BQUksWUFBWSxHQUFJLE1BQU0sQ0FBQyxXQUFXLENBQUM7QUFDdkMsTUFBSSxhQUFhLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQzs7QUFFeEMsTUFBSSxNQUFNLENBQUMsS0FBSyxLQUFLLFlBQVksSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLGFBQWEsRUFBRTtBQUNwRSxVQUFNLENBQUMsS0FBSyxHQUFJLFlBQVksQ0FBQztBQUM3QixVQUFNLENBQUMsTUFBTSxHQUFHLGFBQWEsQ0FBQztHQUMvQjtDQUNGOztBQUVELFNBQVMsU0FBUyxDQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFO0FBQzVDLE1BQUksT0FBTyxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7O0FBRW5DLFNBQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMvQixTQUFPLENBQUMsWUFBWSxHQUFHLGFBQWEsQ0FBQzs7QUFFckMsU0FBTyxDQUFDLE1BQU0sR0FBRyxZQUFZO0FBQzNCLFdBQU8sQ0FBQyxlQUFlLENBQ3JCLE9BQU8sQ0FBQyxRQUFRLEVBQ2hCLFVBQVUsTUFBTSxFQUFFO0FBQUUsZ0JBQVUsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0tBQUUsRUFDakQsVUFBVSxLQUFLLEVBQUU7QUFBRSxhQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQUUsQ0FDekMsQ0FBQztHQUNILENBQUM7QUFDRixTQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7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QU0sQ0FBQyxNQUFNLEdBQUcsYUFBYSxDQUFDO0dBQy9CO0NBQ0Y7O1FBR0MsWUFBWSxHQUFaLFlBQVk7UUFDWixtQkFBbUIsR0FBbkIsbUJBQW1CO1FBQ25CLE1BQU0sR0FBTixNQUFNO1FBQ04scUJBQXFCLEdBQXJCLHFCQUFxQjtRQUNyQixTQUFTLEdBQVQsU0FBUztRQUNULFlBQVksR0FBWixZQUFZIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCB7IEF1ZGlvQ29udGV4dCwgcmVxdWVzdEFuaW1hdGlvbkZyYW1lIH0gZnJvbSAnLi91dGlscyc7XG5cbi8qIEZ1bmN0aW9ucyAqL1xuXG5mdW5jdGlvbiByZXNpemVDYW52YXMgKGNhbnZhcykge1xuICB2YXIgZGlzcGxheVdpZHRoICA9IGNhbnZhcy5jbGllbnRXaWR0aDtcbiAgdmFyIGRpc3BsYXlIZWlnaHQgPSBjYW52YXMuY2xpZW50SGVpZ2h0O1xuXG4gIGlmIChjYW52YXMud2lkdGggIT09IGRpc3BsYXlXaWR0aCB8fCBjYW52YXMuaGVpZ2h0ICE9PSBkaXNwbGF5SGVpZ2h0KSB7XG4gICAgY2FudmFzLndpZHRoICA9IGRpc3BsYXlXaWR0aDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gZGlzcGxheUhlaWdodDtcbiAgfVxufVxuXG5mdW5jdGlvbiBsb2FkQXVkaW8gKGNvbnRleHQsIHNvdXJjZU5vZGUsIHVybCkge1xuICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gIHJlcXVlc3Qub3BlbignR0VUJywgdXJsLCB0cnVlKTtcbiAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuXG4gIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnRleHQuZGVjb2RlQXVkaW9EYXRhKFxuICAgICAgcmVxdWVzdC5yZXNwb25zZSxcbiAgICAgIGZ1bmN0aW9uIChidWZmZXIpIHsgc291cmNlTm9kZS5idWZmZXIgPSBidWZmZXI7IH0sXG4gICAgICBmdW5jdGlvbiAoZXJyb3IpIHsgY29uc29sZS5sb2coZXJyb3IpOyB9XG4gICAgKTtcbiAgfTtcbiAgcmVxdWVzdC5zZW5kKCk7XG59XG5cbmZ1bmN0aW9uIHBsYXlTb3VuZCAoc291cmNlTm9kZSkge1xuICBzb3VyY2VOb2RlLnN0YXJ0KDApO1xufVxuXG5mdW5jdGlvbiBzZXR1cEF1ZGlvTm9kZXMgKGNvbnRleHQpIHtcbiAgLyoqXG4gICAqIGNvbnRleHQuZGVzdGluYXRpb24gaXMgYSBzcGVjaWFsIG5vZGUgdGhhdCBpcyBhc3NvY2lhdGVkXG4gICAqIHdpdGggdGhlIGRlZmF1bHQgYXVkaW8gb3V0cHV0IG9mIHlvdXIgc3lzdGVtXG4gICAqL1xuICB2YXIgc291cmNlTm9kZSA9IGNvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gIHNvdXJjZU5vZGUuY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKTtcblxuICB2YXIgYW5hbHlzZXJOb2RlID0gY29udGV4dC5jcmVhdGVBbmFseXNlcigpO1xuICBhbmFseXNlck5vZGUuc21vb3RoaW5nVGltZUNvbnN0YW50ID0gMC4zO1xuICBhbmFseXNlck5vZGUuZmZ0U2l6ZSA9IDIwNDg7XG5cbiAgdmFyIGphdmFzY3JpcHROb2RlID0gY29udGV4dC5jcmVhdGVTY3JpcHRQcm9jZXNzb3IoMjA0OCwgMSwgMSk7XG4gIGphdmFzY3JpcHROb2RlLmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbik7XG5cbiAgc291cmNlTm9kZS5jb25uZWN0KGFuYWx5c2VyTm9kZSk7XG4gIGFuYWx5c2VyTm9kZS5jb25uZWN0KGphdmFzY3JpcHROb2RlKTtcblxuICByZXR1cm4ge1xuICAgIHNvdXJjZU5vZGU6IHNvdXJjZU5vZGUsXG4gICAgYW5hbHlzZXJOb2RlOiBhbmFseXNlck5vZGUsXG4gICAgamF2YXNjcmlwdE5vZGU6IGphdmFzY3JpcHROb2RlXG4gIH07XG59XG5cbmZ1bmN0aW9uIHZpc3VhbGl6ZSAoKSB7XG4gIC8vIGF1ZGlvIGNvbnRleHQgdmFyaWFibGVzXG4gIHZhciBjb250ZXh0ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xuICB2YXIgbm9kZXMgPSBzZXR1cEF1ZGlvTm9kZXMoY29udGV4dCk7XG4gIHZhciBidWZmZXJMZW5ndGggPSBub2Rlcy5hbmFseXNlck5vZGUuZnJlcXVlbmN5QmluQ291bnQ7XG4gIHZhciBmcmVxdWVuY3lBcnJheSA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlckxlbmd0aCk7XG5cbiAgLy8gY2FudmFzIHZhcmlhYmxlc1xuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpO1xuICB2YXIgY2FudmFzQ3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgcmVzaXplQ2FudmFzKGNhbnZhcyk7XG4gIHZhciB3aWR0aCA9IGNhbnZhcy53aWR0aDtcbiAgdmFyIGhlaWdodCA9IGNhbnZhcy5oZWlnaHQ7XG5cbiAgY2FudmFzQ3R4LmNsZWFyUmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcblxuICBmdW5jdGlvbiBkcmF3ICgpIHtcbiAgICByZXNpemVDYW52YXMoY2FudmFzKTtcbiAgICB3aWR0aCA9IGNhbnZhcy53aWR0aDtcbiAgICBoZWlnaHQgPSBjYW52YXMuaGVpZ2h0O1xuXG4gICAgbm9kZXMuYW5hbHlzZXJOb2RlLmdldEJ5dGVUaW1lRG9tYWluRGF0YShmcmVxdWVuY3lBcnJheSk7XG5cbiAgICBjYW52YXNDdHguZmlsbFN0eWxlID0gJ3JnYigyMDAsIDIwMCwgMjAwKSc7XG4gICAgY2FudmFzQ3R4LmZpbGxSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuXG4gICAgY2FudmFzQ3R4LmxpbmVXaWR0aCA9IDI7XG4gICAgY2FudmFzQ3R4LnN0cm9rZVN0eWxlID0gJ3JnYigwLCAwLCAwKSc7XG5cbiAgICBjYW52YXNDdHguYmVnaW5QYXRoKCk7XG5cbiAgICB2YXIgc2xpY2VXaWR0aCA9IHdpZHRoICogMS4wIC8gYnVmZmVyTGVuZ3RoO1xuICAgIHZhciB4ID0gMDtcblxuICAgIGZyZXF1ZW5jeUFycmF5LmZvckVhY2goZnVuY3Rpb24gKGZyZXF1ZW5jeSwgaSkge1xuICAgICAgdmFyIHkgPSAoZnJlcXVlbmN5IC8gMTI4LjApICogKGhlaWdodCAvIDIpO1xuXG4gICAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgICBjYW52YXNDdHgubW92ZVRvKHgsIHkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2FudmFzQ3R4LmxpbmVUbyh4LCB5KTtcbiAgICAgIH1cblxuICAgICAgeCArPSBzbGljZVdpZHRoO1xuICAgIH0pO1xuXG4gICAgY2FudmFzQ3R4LmxpbmVUbyh3aWR0aCwgaGVpZ2h0IC8gMik7XG4gICAgY2FudmFzQ3R4LnN0cm9rZSgpO1xuXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGRyYXcpO1xuICB9XG5cbiAgbG9hZEF1ZGlvKGNvbnRleHQsIG5vZGVzLnNvdXJjZU5vZGUsICdzb3VuZHMvc3VuZGF5X2NhbmR5Lm1wMycpO1xuICBwbGF5U291bmQobm9kZXMuc291cmNlTm9kZSk7XG4gIGRyYXcoKTtcbn1cblxudmlzdWFsaXplKCk7XG5cbiIsInZhciByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBnbG9iYWwucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IChmdW5jdGlvbiAoKSB7XG4gIHJldHVybiAgZ2xvYmFsLndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgIGdsb2JhbC5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICBnbG9iYWwub1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgIGdsb2JhbC5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgIGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICAgICAgZ2xvYmFsLnNldFRpbWVvdXQoY2FsbGJhY2ssIDEwMDAgLyA2MCk7XG4gICAgICAgICAgfTtcbn0pKCk7XG5cbnZhciBBdWRpb0NvbnRleHQgPSBnbG9iYWwuQXVkaW9Db250ZXh0IHx8IGdsb2JhbC53ZWJraXRBdWRpb0NvbnRleHQ7XG52YXIgT2ZmbGluZUF1ZGlvQ29udGV4dCA9IGdsb2JhbC5PZmZsaW5lQXVkaW9Db250ZXh0IHx8IGdsb2JhbC53ZWJraXRPZmZsaW5lQXVkaW9Db250ZXh0O1xudmFyIFdvcmtlciA9IGdsb2JhbC5Xb3JrZXIgfHwgZ2xvYmFsLndlYmtpdFdvcmtlcjtcblxuZnVuY3Rpb24gbG9hZEF1ZGlvIChhdWRpb0NvbnRleHQsIHVybCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICByZXF1ZXN0Lm9wZW4oJ0dFVCcsIHVybCwgdHJ1ZSk7XG4gICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuXG4gICAgdmFyIG9uRGVjb2RlU3VjY2VzcyA9IGZ1bmN0aW9uIChidWZmZXIpIHsgcmVzb2x2ZShidWZmZXIpOyB9O1xuICAgIHZhciBvbkRlY29kZUZhaWx1cmUgPSBmdW5jdGlvbiAoZXJyb3IpIHsgcmVqZWN0KGVycm9yKTsgfTtcblxuICAgIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgYXVkaW9Db250ZXh0LmRlY29kZUF1ZGlvRGF0YShyZXF1ZXN0LnJlc3BvbnNlLCBvbkRlY29kZVN1Y2Nlc3MsIG9uRGVjb2RlRmFpbHVyZSk7XG4gICAgfTtcblxuICAgIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJlamVjdChFcnJvcignTmV0d29yayBFcnJvcicpKTtcbiAgICB9O1xuXG4gICAgcmVxdWVzdC5zZW5kKCk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZXNpemVDYW52YXMgKGNhbnZhcykge1xuICB2YXIgZGlzcGxheVdpZHRoICA9IGNhbnZhcy5jbGllbnRXaWR0aDtcbiAgdmFyIGRpc3BsYXlIZWlnaHQgPSBjYW52YXMuY2xpZW50SGVpZ2h0O1xuXG4gIGlmIChjYW52YXMud2lkdGggIT09IGRpc3BsYXlXaWR0aCB8fCBjYW52YXMuaGVpZ2h0ICE9PSBkaXNwbGF5SGVpZ2h0KSB7XG4gICAgY2FudmFzLndpZHRoICA9IGRpc3BsYXlXaWR0aDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gZGlzcGxheUhlaWdodDtcbiAgfVxufVxuXG5leHBvcnQge1xuICBBdWRpb0NvbnRleHQsXG4gIE9mZmxpbmVBdWRpb0NvbnRleHQsXG4gIFdvcmtlcixcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lLFxuICBsb2FkQXVkaW8sXG4gIHJlc2l6ZUNhbnZhc1xufTtcbiJdfQ==
