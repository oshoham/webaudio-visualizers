import d3 from 'd3';
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

  // var isBeat = false;
  // var onBeat = function () {
  //   isBeat = true;
  // };

  // var frequencyBins = [];
  // var onFreq = function (frequencyData) {
  //   frequencyBins = frequencyData.slice(0, 500).filter(function (value, i) {
  //     return i % 70 === 0;
  //   });
  // };

  var colors = [
    '#351330',
    '#424254',
    '#64908A',
    '#E8CAA4',
    '#CC2A41'
  ];
  var [fillColor, strokeColor] = d3.shuffle(colors).slice(0, 2);

  // stop audio if we were already playing something
  audioHandler.stopSound();
  // audioHandler.unbind('beat', onBeat);
  // audioHandler.unbind('frequencyData', onFreq);

  // audioHandler.bind('beat', onBeat);
  // audioHandler.bind('frequencyData', onFreq);

  function draw (time) {
    audioHandler.update();
    var isBeat = audioHandler.isBeat;
    var frequencyBins = audioHandler.freqByteData.slice(0, 500).filter(function (value, i) {
      return i % 70 === 0;
    });

    twgl.resizeCanvasToDisplaySize(canvas);
    var width = canvas.width;
    var height = canvas.height;

    canvasCtx.clearRect(0, 0, width, height);

    if (isBeat) {
      [fillColor, strokeColor] = d3.shuffle(colors).slice(0, 2);
      console.log(fillColor, strokeColor);
    }

    canvasCtx.fillStyle = fillColor;
    canvasCtx.fillRect(0, 0, width, height);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = strokeColor;

    var radiusScale = d3.scale.linear()
      .domain([0, d3.max(frequencyBins)])
      .range([0, 420]);

    var x = width / 2;
    var y = height / 2;
    var radius = height / 3;
    var frequency = 10;
    var amp = 0.1 * time;

    var waveAmplitude = isBeat ? 0.06 : 0.03;
    var waveFrequency = 50;
    var rotationSpeed = 0.008;
    var oscillationSpeed = 0.002;

    frequencyBins.forEach(function (frequency, i) {
      canvasCtx.beginPath();
      let radius = radiusScale(frequency);

      for (let angle = 0; angle <= 2 * Math.PI; angle += 0.001) {
        let dx = x + radius * Math.cos(angle) * (1.0 + waveAmplitude * Math.sin(angle * waveFrequency + rotationSpeed * time) * Math.sin(oscillationSpeed * time));
        let dy = y + radius * Math.sin(angle) * (1.0 + waveAmplitude * Math.sin(angle * waveFrequency + rotationSpeed * time) * Math.sin(oscillationSpeed * time));

        // rotate in the opposite direction
        if (i % 2 === 2) {
          [dx, dy] = [dy, dx];
        }

        if (angle === 0) {
          canvasCtx.moveTo(dx, dy);
        } else {
          canvasCtx.lineTo(dx, dy);
        }
      }

      canvasCtx.stroke();
    });

    isBeat = false;

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

  var search = document.getElementById('soundcloud-search');
  var input = document.getElementById('soundcloud-search-input');
  var results = document.getElementById('soundcloud-search-results');

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
      search.classList.add('search--fadeout');
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

  searcher.subscribe(
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
