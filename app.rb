require 'sinatra'

get '/frequency_graph' do
  erb :frequency_graph
end

get '/spectrogram' do
  erb :spectrogram
end

get '/oscilloscope' do
  erb :oscilloscope
end

get '/spectral_flux' do
  erb :spectral_flux
end
