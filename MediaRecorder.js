var mMediaStream;
var mMediaRecorder;
var mBlob;
var audioReplay = document.createElement('audio');

function gUM() {
  navigator.mozGetUserMedia({audio:true},
                       function(s) {
                         mMediaStream = s;
                         document.getElementById('mediastream').value  = mMediaStream;
                       },
                       function(e) {dump(e)});
}
function dataavailablecb(aData) {
  mBlob = new Blob([mBlob, aData.data], {type: 'audio/ogg'});
  document.getElementById('size').value  = mBlob.size;
}

function errorcb(e) {
  alert(e);
}

function stopcb() {
  document.getElementById('status').value  = mMediaRecorder.state;
}

function Start() {
/*

  var context = new AudioContext();
  var buffer = context.createBuffer(1, 204800, context.sampleRate);
  for (var i = 0; i < 204800; ++i) {
    buffer.getChannelData(0)[i] = Math.sin(1000 * 2 * Math.PI * i / context.sampleRate);
  }

  var source = context.createBufferSource();
  source.buffer = buffer;

  var dest = context.createMediaStreamDestination();
  source.connect(dest);
  var elem = document.getElementById('audioelem');
  elem.mozSrcObject = dest.stream;
  source.start(0);
  elem.play();
*/
  if (mMediaRecorder == null)
    mMediaRecorder = new MediaRecorder(mMediaStream);
  mBlob = null;
  mMediaRecorder.onstop = stopcb;
  mMediaRecorder.ondataavailable = dataavailablecb;
  mMediaRecorder.onerror = errorcb;

  mMediaRecorder.start(1000);
  document.getElementById('status').value  = mMediaRecorder.state;
}

function Stop() {
  mMediaRecorder.stop();
}

function Resume() {
  mMediaRecorder.resume();
  document.getElementById('status').value  = mMediaRecorder.state;
}

function Pause() {
  mMediaRecorder.pause();
  document.getElementById('status').value  = mMediaRecorder.state;
}

function Playback() {
  _FReader = new FileReader();
  _FReader.readAsDataURL(mBlob);
  _FReader.onload = function (_FREvent) {
    audioReplay.src = _FREvent.target.result;
    audioReplay.play();
  };
}

window.onload = function() {
  document.getElementById("gerUserMedia").onclick = function() { gUM();};
  document.getElementById("Start").onclick = function() { Start();};
  document.getElementById("Stop").onclick = function() { Stop(); };
  document.getElementById("Resume").onclick = function() { Resume(); };
  document.getElementById("Pause").onclick = function() { Pause(); };
  document.getElementById("Playback").onclick = function() { Playback(); };
};
