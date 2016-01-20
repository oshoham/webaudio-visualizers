var requestAnimationFrame = global.requestAnimationFrame || (function () {
  return  global.webkitRequestAnimationFrame ||
          global.mozRequestAnimationFrame ||
          global.oRequestAnimationFrame ||
          global.msRequestAnimationFrame ||
          function (callback) {
            global.setTimeout(callback, 1000 / 60);
          };
})();

var AudioContext = global.AudioContext || global.webkitAudioContext;
var OfflineAudioContext = global.OfflineAudioContext || global.webkitOfflineAudioContext;
var Worker = global.Worker || global.webkitWorker;

function loadAudio (audioContext, url) {
  return new Promise(function (resolve, reject) {
    var request = new XMLHttpRequest();

    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    var onDecodeSuccess = function (buffer) { resolve(buffer); };
    var onDecodeFailure = function (error) { reject(error); };

    request.onload = function () {
      audioContext.decodeAudioData(request.response, onDecodeSuccess, onDecodeFailure);
    };

    request.onerror = function () {
      reject(Error('Network Error'));
    };

    request.send();
  });
}

function resizeCanvas (canvas) {
  var displayWidth  = canvas.clientWidth;
  var displayHeight = canvas.clientHeight;

  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    canvas.width  = displayWidth;
    canvas.height = displayHeight;
  }
}

export {
  AudioContext,
  OfflineAudioContext,
  Worker,
  requestAnimationFrame,
  loadAudio,
  resizeCanvas
};
