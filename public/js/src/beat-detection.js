import twgl from 'twgl.js';
import {
  AudioContext,
  requestAnimationFrame,
  loadAudio
} from './utils';
import AudioHandler from './audio-handler';
import SoundCloudClient from './soundcloud-client';
import Rx from 'rx';

function visualize (audioHandler, audioUrl) {
  var canvas = document.getElementById('canvas');
  var canvasCtx = canvas.getContext('2d');

  var onBeat = function () {
    console.log('beat');
  };

  // stop audio if we were already playing something
  audioHandler.stopSound();
  audioHandler.unbind('beat', onBeat);

  audioHandler.bind('beat', onBeat);

  function draw (time) {
    twgl.resizeCanvasToDisplaySize(canvas);
    var width = canvas.width;
    var height = canvas.height;

    canvasCtx.clearRect(0, 0, width, height);

    audioHandler.trigger('update');

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

  audioHandler.loadAndPlay(audioUrl).then(function () {
    requestAnimationFrame(draw);
  });
}

function clearChildren (element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function main() {
  var soundCloud = new SoundCloudClient('542f757c8ad6d362950b2467b26259f5');
  var audioHandler = new AudioHandler();

  var input = document.getElementById('soundcloud-search');
  var results = document.getElementById('soundcloud-results');

  var keyup = Rx.Observable.fromEvent(input, 'input')
    .map(function (e) {
      return e.target.value; // Project the text from the input
    })
    .filter(function (text) {
      return text.length > 2 || text.length === 0;
    })
    .distinctUntilChanged(); // Only if the value has changed

  // Search soundcloud
  var searcher = keyup
    .map(function (text) {
      return text.length ? Rx.Observable.fromPromise(soundCloud.search(text)) : Rx.Observable.empty().defaultIfEmpty();
    })
    .switchLatest(); // Ensure no out of order results

  function makeTrackClickHandler (streamUrl) {
    return function () {
      clearChildren(results);
      input.value = '';
      visualize(audioHandler, streamUrl);
    };
  }

  function createListElement (track) {
    let li = document.createElement('li');
    li.innerHTML = `
      <img class='search__results__artwork' src=${track.artwork_url} />
      <span class='search__results__title'>${track.title}</span>
    `;
    li.addEventListener('click', makeTrackClickHandler(track.stream_url), false);
    return li;
  }

  var subscription = searcher.subscribe(
    function (data) {
      data = data || [];
      // Append the results
      clearChildren(results);

      data.forEach(function (track) {
        results.appendChild(createListElement(track));
      });
    },
    function (error) {
      // Handle any errors
      clearChildren(results);

      var li = document.createElement('li');
      li.innerHTML = 'Error: ' + error;
      results.appendChild(li);
    }
  );
}

main();
