export let requestAnimationFrame = global.requestAnimationFrame || (function () {
  return  global.webkitRequestAnimationFrame ||
          global.mozRequestAnimationFrame ||
          global.oRequestAnimationFrame ||
          global.msRequestAnimationFrame ||
          function (callback) {
            global.setTimeout(callback, 1000 / 60);
          };
})();

export let AudioContext = global.AudioContext || global.webkitAudioContext;
export let OfflineAudioContext = global.OfflineAudioContext || global.webkitOfflineAudioContext;
