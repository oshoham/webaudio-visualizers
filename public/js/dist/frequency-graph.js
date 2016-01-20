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
  analyserNode.fftSize = 256;

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

    resizeCanvas(canvas);
    nodes.analyserNode.getByteFrequencyData(frequencyArray);

    canvasCtx.fillStyle = 'rgb(0, 0, 0)';
    canvasCtx.fillRect(0, 0, width, height);

    var barWidth = width / bufferLength;
    var x = 0;

    frequencyArray.forEach(function (frequency) {
      var barHeight = frequency;

      canvasCtx.fillStyle = ['rgb(', barHeight + 100, ', 50, 50)'].join('');
      canvasCtx.fillRect(x, height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    });

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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZnJlcXVlbmN5LWdyYXBoLmpzIiwic3JjL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FDSUEsU0FBUyxZQUFZLENBQUUsTUFBTSxFQUFFO0FBQzdCLE1BQUksWUFBWSxHQUFJLE1BQU0sQ0FBQyxXQUFXLENBQUM7QUFDdkMsTUFBSSxhQUFhLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQzs7QUFFeEMsTUFBSSxNQUFNLENBQUMsS0FBSyxLQUFLLFlBQVksSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLGFBQWEsRUFBRTtBQUNwRSxVQUFNLENBQUMsS0FBSyxHQUFJLFlBQVksQ0FBQztBQUM3QixVQUFNLENBQUMsTUFBTSxHQUFHLGFBQWEsQ0FBQztHQUMvQjtDQUNGOztBQUVELFNBQVMsU0FBUyxDQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFO0FBQzVDLE1BQUksT0FBTyxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7O0FBRW5DLFNBQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMvQixTQUFPLENBQUMsWUFBWSxHQUFHLGFBQWEsQ0FBQzs7QUFFckMsU0FBTyxDQUFDLE1BQU0sR0FBRyxZQUFZO0FBQzNCLFdBQU8sQ0FBQyxlQUFlLENBQ3JCLE9BQU8sQ0FBQyxRQUFRLEVBQ2hCLFVBQVUsTUFBTSxFQUFFO0FBQUUsZ0JBQVUsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0tBQUUsRUFDakQsVUFBVSxLQUFLLEVBQUU7QUFBRSxhQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQUUsQ0FDekMsQ0FBQztHQUNILENBQUM7QUFDRixTQUFPLENBQUMsSUFBSSxFQUFFLENB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b250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHsgQXVkaW9Db250ZXh0LCByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfSBmcm9tICcuL3V0aWxzJztcblxuLyogRnVuY3Rpb25zICovXG5cbmZ1bmN0aW9uIHJlc2l6ZUNhbnZhcyAoY2FudmFzKSB7XG4gIHZhciBkaXNwbGF5V2lkdGggID0gY2FudmFzLmNsaWVudFdpZHRoO1xuICB2YXIgZGlzcGxheUhlaWdodCA9IGNhbnZhcy5jbGllbnRIZWlnaHQ7XG5cbiAgaWYgKGNhbnZhcy53aWR0aCAhPT0gZGlzcGxheVdpZHRoIHx8IGNhbnZhcy5oZWlnaHQgIT09IGRpc3BsYXlIZWlnaHQpIHtcbiAgICBjYW52YXMud2lkdGggID0gZGlzcGxheVdpZHRoO1xuICAgIGNhbnZhcy5oZWlnaHQgPSBkaXNwbGF5SGVpZ2h0O1xuICB9XG59XG5cbmZ1bmN0aW9uIGxvYWRBdWRpbyAoY29udGV4dCwgc291cmNlTm9kZSwgdXJsKSB7XG4gIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgcmVxdWVzdC5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xuICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcic7XG5cbiAgcmVxdWVzdC5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29udGV4dC5kZWNvZGVBdWRpb0RhdGEoXG4gICAgICByZXF1ZXN0LnJlc3BvbnNlLFxuICAgICAgZnVuY3Rpb24gKGJ1ZmZlcikgeyBzb3VyY2VOb2RlLmJ1ZmZlciA9IGJ1ZmZlcjsgfSxcbiAgICAgIGZ1bmN0aW9uIChlcnJvcikgeyBjb25zb2xlLmxvZyhlcnJvcik7IH1cbiAgICApO1xuICB9O1xuICByZXF1ZXN0LnNlbmQoKTtcbn1cblxuZnVuY3Rpb24gcGxheVNvdW5kIChzb3VyY2VOb2RlKSB7XG4gIHNvdXJjZU5vZGUuc3RhcnQoMCk7XG59XG5cbmZ1bmN0aW9uIHNldHVwQXVkaW9Ob2RlcyAoY29udGV4dCkge1xuICAvKipcbiAgICogY29udGV4dC5kZXN0aW5hdGlvbiBpcyBhIHNwZWNpYWwgbm9kZSB0aGF0IGlzIGFzc29jaWF0ZWRcbiAgICogd2l0aCB0aGUgZGVmYXVsdCBhdWRpbyBvdXRwdXQgb2YgeW91ciBzeXN0ZW1cbiAgICovXG4gIHZhciBzb3VyY2VOb2RlID0gY29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgc291cmNlTm9kZS5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pO1xuXG4gIHZhciBhbmFseXNlck5vZGUgPSBjb250ZXh0LmNyZWF0ZUFuYWx5c2VyKCk7XG4gIGFuYWx5c2VyTm9kZS5mZnRTaXplID0gMjU2O1xuXG4gIHZhciBqYXZhc2NyaXB0Tm9kZSA9IGNvbnRleHQuY3JlYXRlU2NyaXB0UHJvY2Vzc29yKDIwNDgsIDEsIDEpO1xuICBqYXZhc2NyaXB0Tm9kZS5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pO1xuXG4gIHNvdXJjZU5vZGUuY29ubmVjdChhbmFseXNlck5vZGUpO1xuICBhbmFseXNlck5vZGUuY29ubmVjdChqYXZhc2NyaXB0Tm9kZSk7XG5cbiAgcmV0dXJuIHtcbiAgICBzb3VyY2VOb2RlOiBzb3VyY2VOb2RlLFxuICAgIGFuYWx5c2VyTm9kZTogYW5hbHlzZXJOb2RlLFxuICAgIGphdmFzY3JpcHROb2RlOiBqYXZhc2NyaXB0Tm9kZVxuICB9O1xufVxuXG5mdW5jdGlvbiB2aXN1YWxpemUgKCkge1xuICAvLyBhdWRpbyBjb250ZXh0IHZhcmlhYmxlc1xuICB2YXIgY29udGV4dCA9IG5ldyBBdWRpb0NvbnRleHQoKTtcbiAgdmFyIG5vZGVzID0gc2V0dXBBdWRpb05vZGVzKGNvbnRleHQpO1xuICB2YXIgYnVmZmVyTGVuZ3RoID0gbm9kZXMuYW5hbHlzZXJOb2RlLmZyZXF1ZW5jeUJpbkNvdW50O1xuICB2YXIgZnJlcXVlbmN5QXJyYXkgPSBuZXcgVWludDhBcnJheShidWZmZXJMZW5ndGgpO1xuXG4gIC8vIGNhbnZhcyB2YXJpYWJsZXNcbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKTtcbiAgdmFyIGNhbnZhc0N0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gIHJlc2l6ZUNhbnZhcyhjYW52YXMpO1xuICB2YXIgd2lkdGggPSBjYW52YXMud2lkdGg7XG4gIHZhciBoZWlnaHQgPSBjYW52YXMuaGVpZ2h0O1xuXG4gIGNhbnZhc0N0eC5jbGVhclJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG5cbiAgZnVuY3Rpb24gZHJhdyAoKSB7XG4gICAgcmVzaXplQ2FudmFzKGNhbnZhcyk7XG4gICAgd2lkdGggPSBjYW52YXMud2lkdGg7XG4gICAgaGVpZ2h0ID0gY2FudmFzLmhlaWdodDtcblxuICAgIHJlc2l6ZUNhbnZhcyhjYW52YXMpO1xuICAgIG5vZGVzLmFuYWx5c2VyTm9kZS5nZXRCeXRlRnJlcXVlbmN5RGF0YShmcmVxdWVuY3lBcnJheSk7XG5cbiAgICBjYW52YXNDdHguZmlsbFN0eWxlID0gJ3JnYigwLCAwLCAwKSc7XG4gICAgY2FudmFzQ3R4LmZpbGxSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuXG4gICAgdmFyIGJhcldpZHRoID0gKHdpZHRoIC8gYnVmZmVyTGVuZ3RoKTtcbiAgICB2YXIgeCA9IDA7XG5cbiAgICBmcmVxdWVuY3lBcnJheS5mb3JFYWNoKGZ1bmN0aW9uIChmcmVxdWVuY3kpIHtcbiAgICAgIHZhciBiYXJIZWlnaHQgPSBmcmVxdWVuY3k7XG5cbiAgICAgIGNhbnZhc0N0eC5maWxsU3R5bGUgPSBbJ3JnYignLCAoYmFySGVpZ2h0ICsgMTAwKSwgJywgNTAsIDUwKSddLmpvaW4oJycpO1xuICAgICAgY2FudmFzQ3R4LmZpbGxSZWN0KHgsIGhlaWdodCAtIGJhckhlaWdodCwgYmFyV2lkdGgsIGJhckhlaWdodCk7XG5cbiAgICAgIHggKz0gYmFyV2lkdGggKyAxO1xuICAgIH0pO1xuXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGRyYXcpO1xuICB9XG5cbiAgbG9hZEF1ZGlvKGNvbnRleHQsIG5vZGVzLnNvdXJjZU5vZGUsICdzb3VuZHMvc3VuZGF5X2NhbmR5Lm1wMycpO1xuICBwbGF5U291bmQobm9kZXMuc291cmNlTm9kZSk7XG4gIGRyYXcoKTtcbn1cblxudmlzdWFsaXplKCk7XG5cbiIsInZhciByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBnbG9iYWwucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IChmdW5jdGlvbiAoKSB7XG4gIHJldHVybiAgZ2xvYmFsLndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgIGdsb2JhbC5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICBnbG9iYWwub1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgIGdsb2JhbC5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgIGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICAgICAgZ2xvYmFsLnNldFRpbWVvdXQoY2FsbGJhY2ssIDEwMDAgLyA2MCk7XG4gICAgICAgICAgfTtcbn0pKCk7XG5cbnZhciBBdWRpb0NvbnRleHQgPSBnbG9iYWwuQXVkaW9Db250ZXh0IHx8IGdsb2JhbC53ZWJraXRBdWRpb0NvbnRleHQ7XG52YXIgT2ZmbGluZUF1ZGlvQ29udGV4dCA9IGdsb2JhbC5PZmZsaW5lQXVkaW9Db250ZXh0IHx8IGdsb2JhbC53ZWJraXRPZmZsaW5lQXVkaW9Db250ZXh0O1xudmFyIFdvcmtlciA9IGdsb2JhbC5Xb3JrZXIgfHwgZ2xvYmFsLndlYmtpdFdvcmtlcjtcblxuZnVuY3Rpb24gbG9hZEF1ZGlvIChhdWRpb0NvbnRleHQsIHVybCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICByZXF1ZXN0Lm9wZW4oJ0dFVCcsIHVybCwgdHJ1ZSk7XG4gICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuXG4gICAgdmFyIG9uRGVjb2RlU3VjY2VzcyA9IGZ1bmN0aW9uIChidWZmZXIpIHsgcmVzb2x2ZShidWZmZXIpOyB9O1xuICAgIHZhciBvbkRlY29kZUZhaWx1cmUgPSBmdW5jdGlvbiAoZXJyb3IpIHsgcmVqZWN0KGVycm9yKTsgfTtcblxuICAgIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgYXVkaW9Db250ZXh0LmRlY29kZUF1ZGlvRGF0YShyZXF1ZXN0LnJlc3BvbnNlLCBvbkRlY29kZVN1Y2Nlc3MsIG9uRGVjb2RlRmFpbHVyZSk7XG4gICAgfTtcblxuICAgIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJlamVjdChFcnJvcignTmV0d29yayBFcnJvcicpKTtcbiAgICB9O1xuXG4gICAgcmVxdWVzdC5zZW5kKCk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZXNpemVDYW52YXMgKGNhbnZhcykge1xuICB2YXIgZGlzcGxheVdpZHRoICA9IGNhbnZhcy5jbGllbnRXaWR0aDtcbiAgdmFyIGRpc3BsYXlIZWlnaHQgPSBjYW52YXMuY2xpZW50SGVpZ2h0O1xuXG4gIGlmIChjYW52YXMud2lkdGggIT09IGRpc3BsYXlXaWR0aCB8fCBjYW52YXMuaGVpZ2h0ICE9PSBkaXNwbGF5SGVpZ2h0KSB7XG4gICAgY2FudmFzLndpZHRoICA9IGRpc3BsYXlXaWR0aDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gZGlzcGxheUhlaWdodDtcbiAgfVxufVxuXG5leHBvcnQge1xuICBBdWRpb0NvbnRleHQsXG4gIE9mZmxpbmVBdWRpb0NvbnRleHQsXG4gIFdvcmtlcixcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lLFxuICBsb2FkQXVkaW8sXG4gIHJlc2l6ZUNhbnZhc1xufTtcbiJdfQ==