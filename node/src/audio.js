"use strict";

export default setup_audio;

var audioCtxs = [],
  rate,
  sources = [],
  gainNodes = [],
  application,
  stopTimer1,
  stopTimer2,
  startTimer;

var current_ctx = 1;

function setup_audio(_app) {
  application = _app;
  application.play_wave = play_wave;
  application.stop_audio = stop_audio;
  audio_event_listeners();
}

function audio_event_listeners() {
  document.getElementById("listen").addEventListener("click", listen_to_drawn_wave);
  document.getElementById("transformed-audio-enable").addEventListener("change", function() {
    if (this.value==="on") {
      application.start_transformed_late();
    } else {
      stop_audio();
    }
  });
}

function stop_audio() {
  clearTimeout(startTimer);

  if (sources[1]) {
    sources[1].stop();
  }
  if (sources[2]) {
    sources[2].stop();
  }
}

function listen_to_drawn_wave() {
  var wave = application.get_drawn_wave();
  play_wave(wave, 2);
}

function play_wave(wave, duration) {
  var audioCtx,
    source,
    gainNode;
  if (current_ctx === 2) {
    current_ctx = 1;
  } else {
    current_ctx = 2;
  }
  audioCtx = audioCtxs[current_ctx];
  source = sources[current_ctx];
  gainNode = gainNodes[current_ctx];
  if (typeof(audioCtx)==="undefined") {
    audioCtx = new window.AudioContext({
      sampleRate: 44100
    });
    audioCtxs[current_ctx] = audioCtx;
  }
  rate = audioCtx.sampleRate;
  var min_mag = 512;
  var start_x = 0;
  for (var x = 0, xx = wave.length; x<xx; x++) {
    var mag = Math.abs(wave[x] - 0);
    if (mag < min_mag) {
      start_x = x;
      min_mag = mag;
    }
  } 
  start_x = 0;
  var buffer = audioCtx.createBuffer(1, 256, rate);
  var channel = buffer.getChannelData(0);
  for (var i = 0; i < buffer.length; i++) {
    channel[i] = wave[(i+start_x)%256]/4096;
  }
  if (stopTimer1) {
    clearTimeout(stopTimer1);
  }
  stopTimer1 = setTimeout(function() {
    stop_playing_source();
  }, 100);
  
  if (stopTimer2) {
    clearTimeout(stopTimer2);
  }
  stopTimer2 = setTimeout(function() {
    source.stop();
  }, duration*1000);

  if (startTimer) {
    clearTimeout(startTimer);
  }
  startTimer = setTimeout(function() {
    if (source) {
      source.stop();
    }
    source = audioCtx.createBufferSource();
    sources[current_ctx] = source;
    source.buffer = buffer;
    source.loop = true;
    gainNode = audioCtx.createGain();
    gainNodes[current_ctx] = gainNode;
    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    source.start();
    gainNode.gain.setValueAtTime(0.00001, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(1, audioCtx.currentTime + 0.1);
  }, 100);

  return startTimer;

}

function stop_playing_source(cb) {
  if (typeof(cb)==="undefined") {
    cb = function() {};
  }
  var other_ctx = 1;
  if (current_ctx === 1) {
    other_ctx = 2;
  }
  var audioCtx = audioCtxs[other_ctx], 
    source = sources[other_ctx], 
    gainNode = gainNodes[other_ctx];
  
  if (typeof(source)!=="undefined") {
    gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.1);
    setTimeout(function() {
      source.stop();
      cb();
    }, 70);
  } else {
    cb();
  }
}