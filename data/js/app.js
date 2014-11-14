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
  var store = new Store();
  var profilerManager = new ProfilerManager(store);

  var hubElements = {
    searchBar: document.getElementById('searchBar'),
    searchPanel: document.getElementById('searchPanel'),
    startSearch: document.getElementById('startSearch'),
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
    'store': store
  };
  var padManager = new PadManager(padOption);
  padManager.start();

  var rankOption = {
    'elements': {'infoTable': document.getElementById('infoTable')},
    'store': store
  };
  var rankManager = new RankManager(rankOption);
  rankManager.start();
}
