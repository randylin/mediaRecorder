var mMediaStream;
var mMediaStream2;
var mMediaRecorder;
var mMediaRecorder2;
var mBlob;
var mBlob2;
var audioReplay = document.createElement('audio');
var audioout = document.createElement('audio');
var videoReplay;


function gUM() {
  navigator.mozGetUserMedia({audio:true},
                       function(s) {
                         mMediaStream = s;
                         document.getElementById('mediastream').value  = mMediaStream;
                       },
                       function(e) {dump(e)});
}

function gFakeGUM() {
  navigator.mozGetUserMedia({audio:true, fake:true},
                       function(s) {
                         mMediaStream = s;
                         document.getElementById('mediastream').value  = mMediaStream;
                       },
                       function(e) {dump(e)});
}

function gUM2() {
  navigator.mozGetUserMedia({audio:true},
                       function(s) {
                         mMediaStream2 = s;
                         document.getElementById('mediastream').value  = mMediaStream2;
                       },
                       function(e) {dump(e)});
}


function gAVUM() {
  navigator.mozGetUserMedia({audio:true, video:true},
                       function(s) {
                         mMediaStream = s;
                         document.getElementById('mediastream').value  = mMediaStream;
			 document.getElementById("videoelemsrc").mozSrcObject = mMediaStream;
                         document.getElementById("videoelemsrc").play();
                       },
                       function(e) {dump(e)});
}

function gVUM() {
  navigator.mozGetUserMedia({audio:false, video:true},
                       function(s) {
                         mMediaStream = s;
                         document.getElementById('mediastream').value  = mMediaStream;
			 document.getElementById("videoelemsrc").mozSrcObject = mMediaStream;
                         document.getElementById("videoelemsrc").play();
                       },
                       function(e) {dump(e)});
}

function gFakeAVUM() {
  navigator.mozGetUserMedia({audio:true, video:true, fake:true},
                       function(s) {
                         mMediaStream = s;
                         document.getElementById('mediastream').value  = mMediaStream;
			 document.getElementById("videoelemsrc").mozSrcObject = mMediaStream;
                         document.getElementById("videoelemsrc").play();
                       },
                       function(e) {dump(e)});
}

function dataavailablecb(aData) {
  if (mBlob) {
    mBlob = new Blob([mBlob, aData.data], {type: aData.data.type});
  } else {
    mBlob = new Blob([aData.data], {type: aData.data.type});
  }
  document.getElementById('status').value  += 'datacb';
  document.getElementById('size').value  = mBlob.size;
  document.getElementById('mime').value = aData.data.type;
}

function dataavailablecb2(aData) {

  mBlob2 = new Blob([mBlob2, aData.data], {type: aData.data.type});
  document.getElementById('size2').value  = mBlob2.size;
  document.getElementById('mime').value = aData.data.type;
}

function done() {
  dump("done");
};

var pendingStorageWrites;
function saveToStorage(blob, storage, filename, partInfo, isRetry) {
    pendingStorageWrites++;
    var dstorage = navigator.getDeviceStorages(storage)[1];
    // use index 1 in flame to indicate external storage
    var req = dstorage.delete(filename);
    req = dstorage.addNamed(blob, filename);
    req.onerror = function() {
      console.warn('failed to save attachment to', storage, filename,
                   'type:', blob.type);
      pendingStorageWrites--;
      // if we failed to unique the file after appending junk, just give up
      if (isRetry) {
        if (pendingStorageWrites === 0)
          done();
        return;
      }
      // retry by appending a super huge timestamp to the file before its
      // extension.
      var idxLastPeriod = filename.lastIndexOf('.');
      if (idxLastPeriod === -1)
        idxLastPeriod = filename.length;
      filename = filename.substring(0, idxLastPeriod) + '-' + Date.now() +
                   filename.substring(idxLastPeriod);
      saveToStorage(blob, storage, filename, partInfo, true);
    };
    req.onsuccess = function() {
      console.log('saved attachment to', storage, filename, 'type:', blob.type);
      partInfo.file = [storage, filename];
      if (--pendingStorageWrites === 0)
        done();
    };
}

function SaveBlobSD() {
  var fname;
  if (mBlob.type === 'audio/ogg') {
    fname = "data.opus";
  } else if (mBlob.type === 'audio/3gpp') {
    fname = "data.3gpp";
  } else if (mBlob.type === 'video/mp4') {
    fname = "data.mp4";
  } else if (mBlob.type === 'video/webm') {
    fname = "data.webm";
  } else {
    fname = "data.bin";
  }

  dump("save " + mBlob.size);
  fname = Math.round(10000*Math.random()) + fname;
  saveToStorage(mBlob, "sdcard", fname, "abc", 1);
}

function SaveBlob() {
  var downloadLink = document.createElement("a");
  var blob = new Blob([mBlob], {type: "application/octet-stream"});
  downloadLink.href = window.URL.createObjectURL(blob);
  if (mBlob.type === 'audio/ogg') {
    downloadLink.download = "data.opus";
  } else if (mBlob.type === 'audio/3gpp') {
    downloadLink.download = "data.3gpp";
  } else if (mBlob.type === 'video/mp4') {
    downloadLink.download = "data.mp4";
  } else if (mBlob.type === 'video/webm') {
    downloadLink.download = "data.webm";
  } else {
    downloadLink.download = "data.bin";
  }
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
    
}

function errorcb(e) {
  alert(e);
}

function stopcb() {
  document.getElementById('status').value  += 'stop';
  document.getElementById('status').value  += mMediaRecorder.state;
}

function startcb() {
  document.getElementById('status').value  += 'startcb';
}


function getAudioContext() {
  var context = new AudioContext();
  var buffer = context.createBuffer(1, 409600, context.sampleRate);
  for (var i = 0; i < 409600; ++i) {
    buffer.getChannelData(0)[i] = Math.sin(1000 * 2 * Math.PI * i / context.sampleRate);
  }

  var source = context.createBufferSource();
  source.buffer = buffer;

  var dest = context.createMediaStreamDestination();
  source.connect(dest);
  var elem = document.getElementById('audioelem');
  elem.mozSrcObject = dest.stream;
  mMediaStream = dest.stream;
  source.start(0);
  elem.play();

}

function get4chAudioContext() {
  var context = new AudioContext();
  var buffer = context.createBuffer(4, 409600, context.sampleRate);
  for (var i = 0; i < 409600; ++i) {
    buffer.getChannelData(0)[i] = Math.sin(1000 * 2 * Math.PI * i / context.sampleRate);
    buffer.getChannelData(1)[i] = Math.sin(1000 * 2 * Math.PI * i / context.sampleRate);
    buffer.getChannelData(2)[i] = Math.sin(1000 * 2 * Math.PI * i / context.sampleRate);
    buffer.getChannelData(3)[i] = Math.sin(1000 * 2 * Math.PI * i / context.sampleRate);
  }

  var source = context.createBufferSource();
  source.buffer = buffer;

  var dest = context.createMediaStreamDestination();
  dest.channelCount = 4;
  source.channelCountMode = 'explicit';
  source.connect(dest);
  var elem = document.getElementById('audioelem');
  elem.mozSrcObject = dest.stream;
  mMediaStream = dest.stream;
  source.start(0);
  elem.play();

}

function getAudioTag() {
  var a = document.getElementById('audioelem');
  a.src = "dtmfmono48k.ogg";
  audioout.mozSrcObject = a.mozCaptureStreamUntilEnded();
  mMediaStream = a.mozCaptureStreamUntilEnded();
  a.play();
  document.body.appendChild(audioout);
  audioout.play();
}

function getAudioTag2ch() {
  var a = document.getElementById('audioelem');
  a.src = "ehren.opus";
  audioout.mozSrcObject = a.mozCaptureStreamUntilEnded();
  mMediaStream = a.mozCaptureStreamUntilEnded();
  a.play();
  document.body.appendChild(audioout);
  audioout.play();
}

function getAudioTagNo() {
  var a = document.getElementById('audioelem');
  a.src = "big.wav";
  audioout.mozSrcObject = a.mozCaptureStreamUntilEnded();
  mMediaStream = a.mozCaptureStreamUntilEnded();
  a.play();
  document.body.appendChild(audioout);
  audioout.play();
}

function Start(time) {
  if (mMediaRecorder == null)
    mMediaRecorder = new MediaRecorder(mMediaStream);
  else if (mMediaRecorder.state != "inactive") {
    alert("mMediaRecorder is not inactive, stop it first");
    return;
  }
  mBlob = null;
  mMediaRecorder.onstart = startcb;
  mMediaRecorder.onstop = stopcb;
  mMediaRecorder.ondataavailable = dataavailablecb;
  mMediaRecorder.onerror = errorcb;
  mMediaRecorder.start(time);
  document.getElementById('status').value  = mMediaRecorder.state;
}

function StartOpt() {
  if (mMediaRecorder == null) {
    mMediaRecorder = new MediaRecorder(mMediaStream, {"mimeType": "audio/3gpp"});
  } else if (mMediaRecorder.state != "inactive") {
    alert("mMediaRecorder is not inactive, stop it first");
    return;
  }
  mBlob = null;
  mMediaRecorder.onstart = startcb;
  mMediaRecorder.onstop = stopcb;
  mMediaRecorder.ondataavailable = dataavailablecb;
  mMediaRecorder.onerror = errorcb;
  mMediaRecorder.start(1000);
  document.getElementById('status').value  = mMediaRecorder.state;
}

function StartI2(time) {
  if (mMediaRecorder2 == null)
    mMediaRecorder2 = new MediaRecorder(mMediaStream);
  else if (mMediaRecorder2.state != "inactive") {
    alert("mMediaRecorder is not inactive, stop it first");
    return;
  }
  mBlob2 = null;
  mMediaRecorder.onstart = startcb;
  mMediaRecorder2.onstop = stopcb;
  mMediaRecorder2.ondataavailable = dataavailablecb2;
  mMediaRecorder2.onerror = errorcb;
  mMediaRecorder2.start(time);
//  document.getElementById('status').value  = mMediaRecorder.state;
}

function Start0WithEvent() {
  if (mMediaRecorder == null)
    mMediaRecorder = new MediaRecorder(mMediaStream);
  else if (mMediaRecorder.state != "inactive") {
    alert("mMediaRecorder is not inactive, stop it first");
    return;
  }
  mBlob = null;
  mMediaRecorder.onstart = startcb;
  mMediaRecorder.onstop = stopcb;
  mMediaRecorder.ondataavailable = function(e) {
                                                mMediaRecorder.requestData();
                                                dataavailablecb(e);
                                                console.log(e);}
  mMediaRecorder.onerror = errorcb;
  mMediaRecorder.start(0);
  mMediaRecorder.requestData();
  document.getElementById('status').value  = mMediaRecorder.state;
}

function Stop() {
  mMediaRecorder.stop();
}

function stopms() {
  if (audioout.stop)
    audioout.stop();
  var elem = document.getElementById('audioelem');
  if (elem.stop)
    elem.stop();
  if (mMediaStream && mMediaStream.stop) {
    mMediaStream.stop();
    mMediaStream = null;
  }
  document.getElementById('mediastream').value  = mMediaStream;
}
function Resume() {
  mMediaRecorder.resume();
  document.getElementById('status').value  += mMediaRecorder.state;
}

function Pause() {
  mMediaRecorder.pause();
  document.getElementById('status').value  += mMediaRecorder.state;
}

function Playback() {
  _FReader = new FileReader();
  _FReader.readAsDataURL(mBlob);
  _FReader.onload = function (_FREvent) {
    audioReplay.src = _FREvent.target.result;
    audioReplay.play();
  };
}

function PlaybackIDX() {
        var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
        var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || { READ_WRITE: 'readwrite' } ;
        var request = indexedDB.open("creatures", 2);
        request.onsuccess = function(event) {
          indexedDB.db = event.target.result;
        var transaction = indexedDB.db.transaction(["ogg"], "readwrite");

        transaction.objectStore("ogg").get("audio").onsuccess = function (event) {
                var audioblob = event.target.result;
                console.log("Got blob!" + audioblob.size);
                _FReader = new FileReader();
                _FReader.readAsDataURL(audioblob);
                _FReader.onload = function (_FREvent) {
                  audioReplay.src = _FREvent.target.result;
                  audioReplay.play();
                };
        };
        indexedDB.db.close();
        }
}

function Save() {
        if (!mBlob) {
          alert("no audio blob");
        }
        var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
        var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || { READ_WRITE: 'readwrite' } ;

        var request = indexedDB.open("creatures", 2);
        request.onupgradeneeded = function () {
           request.result.createObjectStore("ogg");
        };
        request.onerror = function(event) {
          alert(event);
        }
        request.onsuccess = function(event) {
          indexedDB.db = event.target.result;
        var transaction = indexedDB.db.transaction(["ogg"], "readwrite");
        transaction.objectStore("ogg").put(mBlob, "audio");
        indexedDB.db.close();
        }
}

function binStringToHex3(s) {
        var s2 = '', c;
        for (var i = 0, l = s.length; i < l; ++i) {
          c = s.charCodeAt(i);
          s2 += (c >> 4).toString(16);
          s2 += (c & 0xF).toString(16);
        }
        return s2;
}

function PlaybackVideo() {
  _FReader = new FileReader();
//bug...
  _FReader.readAsDataURL(mBlob);
  _FReader.onload = function (_FREvent) {
    videoReplay.src = _FREvent.target.result;
    videoReplay.onended = function(e) { e.target.src = ""; } 
    videoReplay.play();
  };
}

function PlayVideo()
{
  document.getElementById("videoelemsrc").src = 'gizmo.mp4';
  document.getElementById("videoelemsrc").play();
  document.getElementById("videoelemsrc").onended = function(e) { e.target.src = ""; } 
  mMediaStream = document.getElementById("videoelemsrc").mozCaptureStreamUntilEnded();
  mMediaRecorder = null;
}

function PlayVideo2()
{
  document.getElementById("videoelemsrc").src = 'synctest.webm';
  document.getElementById("videoelemsrc").onended = function(e) { e.target.src = ""; } 
  document.getElementById("videoelemsrc").play();
  mMediaStream = document.getElementById("videoelemsrc").mozCaptureStreamUntilEnded();
  mMediaRecorder = null;
}

function PlayVideo3()
{
  document.getElementById("videoelemsrc").src = 'vp9cake.webm';
  document.getElementById("videoelemsrc").onended = function(e) { e.target.src = ""; } 
  document.getElementById("videoelemsrc").play();
  mMediaStream = document.getElementById("videoelemsrc").mozCaptureStreamUntilEnded();
  mMediaRecorder = null;
}

function PlayVideo4()
{
  document.getElementById("videoelemsrc").src = '720p.webm';
  document.getElementById("videoelemsrc").onended = function(e) { e.target.src = ""; } 
  document.getElementById("videoelemsrc").play();
  mMediaStream = document.getElementById("videoelemsrc").mozCaptureStreamUntilEnded();
  mMediaRecorder = null;
}

function PlayVideo5()
{
  document.getElementById("videoelemsrc").src = '352x288.webm';
  document.getElementById("videoelemsrc").onended = function(e) { e.target.src = ""; } 
  document.getElementById("videoelemsrc").play();
  mMediaStream = document.getElementById("videoelemsrc").mozCaptureStreamUntilEnded();
  mMediaRecorder = null;
}

function PlayVideo6()
{
  document.getElementById("videoelemsrc").src = 'pixel_aspect_ratio.ogg';
  document.getElementById("videoelemsrc").onended = function(e) { e.target.src = ""; } 
  document.getElementById("videoelemsrc").play();
  mMediaStream = document.getElementById("videoelemsrc").mozCaptureStreamUntilEnded();
  mMediaRecorder = null;
}

function installHostedApp() {
  var request = navigator.mozApps.install('manifest.webapp');

  request.onsuccess = function(e) {
    console.log('Installed successfully');
  };

  request.onerror = function(err) {
    console.log('Error: ' + err.target.error.name);
  };
}

function WebRTCPage() {
  var d2=new Date();
  var hours = d2.getHours();
  if (hours > 12) {
      hours -= 12;
  } else if (hours === 0) {
     hours = 12;
  }
  location.replace("https://apprtc.appspot.com/?r=qqqqq" + hours + Math.floor(d2.getMinutes()/3));
}
window.onload = function() {
  document.getElementById("install").onclick = function() { installHostedApp();};
  document.getElementById("getUserMedia").onclick = function() { gUM();};
  document.getElementById("getUserMedia2").onclick = function() { gUM2();};
  document.getElementById("getFakeUserMedia").onclick = function() { gFakeGUM();};
  document.getElementById("getAudioContext").onclick = function() { getAudioContext();};
  document.getElementById("get4chAudioContext").onclick = function() { get4chAudioContext();};
  document.getElementById("getAudioTag").onclick = function() { getAudioTag();};
  document.getElementById("getAudioTag2ch").onclick = function() { getAudioTag2ch();};
  document.getElementById("getAudioTagNo").onclick = function() { getAudioTagNo();};
  document.getElementById("Start").onclick = function() { Start(1000);};
  document.getElementById("SetNull").onclick = function() { mMediaRecorder = null; };
  document.getElementById("Start0").onclick = function() { Start(0);};
  document.getElementById("StartOpt").onclick = function() { StartOpt();};
  document.getElementById("Start0WithEvent").onclick = function() { Start0WithEvent();};
  document.getElementById("Stop").onclick = function() { Stop(); };
  document.getElementById("Stopms").onclick = function() { stopms(); };
  document.getElementById("requestData").onclick = function() { mMediaRecorder.requestData(); };
  document.getElementById("Resume").onclick = function() { Resume(); };
  document.getElementById("Pause").onclick = function() { Pause(); };
  document.getElementById("Save").onclick = function() { Save(); };
  document.getElementById("SaveBlob").onclick = function() { SaveBlob(); };
  document.getElementById("SaveBlobSD").onclick = function() { SaveBlobSD(); };
  document.getElementById("Playback").onclick = function() { Playback(); };
  document.getElementById("PlaybackIDX").onclick = function() { PlaybackIDX(); };
  document.getElementById("getAVUserMedia").onclick = function() { gAVUM();};
  document.getElementById("getVUserMedia").onclick = function() { gVUM();};
  document.getElementById("getFakeAVUserMedia").onclick = function() { gFakeAVUM();};
  document.getElementById("PlaybackVideo").onclick = function() { PlaybackVideo(); };
  document.getElementById("PlayVideo").onclick = function() { PlayVideo(); };
  document.getElementById("PlayVideo2").onclick = function() { PlayVideo2(); };
  document.getElementById("PlayVideo3").onclick = function() { PlayVideo3(); };
  document.getElementById("PlayVideo4").onclick = function() { PlayVideo4(); };
  document.getElementById("PlayVideo5").onclick = function() { PlayVideo5(); };
  document.getElementById("PlayVideo6").onclick = function() { PlayVideo6(); };
  document.getElementById("WEBRTC").onclick = function() { WebRTCPage(); };
  videoReplay = document.getElementById("videoelem");};
