'use strict';
// DOMContentLoaded is fired once the document has been loaded and parsed,
// but without waiting for other external resources to load (css/images/etc)
// That makes the app more responsive and perceived as faster.
// https://developer.mozilla.org/Web/Reference/Events/DOMContentLoaded
window.addEventListener('DOMContentLoaded', start);

function start() {
  if (! ('memprofiler' in navigator)) {
    console.log('use mock !!!!');
    navigator.memprofiler = new MockMemProfiler();
  } else {
    console.log('use real memProfiler');
  }
  var profilerManager = new ProfilerManager();

  var hubElements = {
    searchBar: document.getElementById('searchBar'),
    startButton: document.getElementById('startRecord'),
    stopButton: document.getElementById('stopRecord'),
    infoTable: document.getElementById('infoTable')
  };

  var hubOption = {
    'elements': hubElements,
    'profilerManager': profilerManager
  };
  var hub = new Hub(hubOption);
  hub.start();

  var padOption = {
    'elements': {'pad': document.getElementById('pad')},
    'profilerManager': profilerManager
  };
  var padManager = new PadManager(padOption);
  padManager.start();
}
