/* globals importScripts, self, stft, spectralFlux, normalize */

importScripts('stft-worker-helpers.js');

self.onmessage = function (e) {
  var buffer = e.data;
  var stftData = stft(buffer);
  var spectralFluxData = spectralFlux(stftData);
  var normalizedSpectralFluxData = normalize(spectralFluxData);

  self.postMessage({
    stftData: stftData,
    spectralFluxData: spectralFluxData,
    normalizedSpectralFluxData: normalizedSpectralFluxData,
  });
};
