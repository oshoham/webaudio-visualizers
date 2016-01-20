/* globals importScripts, self, stft, spectralFlux, standardize */

importScripts('stft-worker-helpers.js');

self.onmessage = function (e) {
  var buffer = e.data;
  var stftData = stft(buffer);
  var spectralFluxData = spectralFlux(stftData);
  var standardizedSpectralFluxData = standardize(spectralFluxData);

  self.postMessage({
    stftData: stftData,
    spectralFluxData: spectralFluxData,
    standardizedSpectralFluxData: standardizedSpectralFluxData
  });
};
