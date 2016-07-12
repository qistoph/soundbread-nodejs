function recStatus(msg) {
  $('#recStatus').text(msg);
}

var audio_context;
var recorder;

function startUserMedia(stream) {
  var input = audio_context.createMediaStreamSource(stream);
  console.debug('Media stream created.' );
  console.debug("input sample rate " +input.context.sampleRate);

  // Feedback!
  //input.connect(audio_context.destination);
  console.debug('Input connected to audio context destination.');

  recorder = new Recorder(input, {
    numChannels: 1
  });
  console.debug('Recorder initialised.');

  startRecording();
}

function startRecording() {
  recorder && recorder.record();
  recStatus('Recording...');
}

function abortRecording(button) {
  recorder && recorder.stop();
  recStatus('Recording aborted.');
}

function stopRecording(button) {
  recorder && recorder.stop();
  recStatus('Stopped recording.');

  // create WAV download link using audio data blob
  createDownloadLink();

  recorder.clear();
}

function createDownloadLink() {
  recorder && recorder.exportWAV(function(b64data) {
    recStatus('Sending...');
    console.log("< playrec: [data]");
    socket.emit('playrec', b64data);
    recStatus('Done');
  });
}

function initRecorder(startRecording = false) {
  try {
    // webkit shim
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    navigator.getUserMedia = ( navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia);
    window.URL = window.URL || window.webkitURL;

    audio_context = new AudioContext;
    console.debug('Audio context set up.');
    console.debug('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
  } catch (e) {
    alert('No web audio support in this browser!');
  }

  navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
    alert('No live audio input: ' + e);
    console.debug(e)
  });
}

$(document).ready(function() {
  socket.on('playrec', function(data) {
    console.log("> playrec: [data] (" + data.user + ")");
    var url = 'data:audio/mp3;base64,'+data.audio;
    var snd = new Audio(url);
    snd.play();
  });

  $('#btnRecord').mousedown(function() {
    $('#btnRecord').mousedown(function() {
      startRecording();
    });
    initRecorder(true);
  });

  $('#btnRecord').mouseup(function() {
    stopRecording();
  });

  $(document).mouseup(function(e) {
    var buttons = $('#btnRecord');
    if(!buttons.is(e.target)) {
      abortRecording();
    }
  });
});

