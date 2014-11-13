'use strict';

(function(exports) {
  function ProfilerManager() {
    this.init();
  }

  ProfilerManager.prototype.init = function PM_init() {
    this.PR = {};
    this.memoryProfiler = navigator.memprofiler;
  };

  ProfilerManager.prototype.startRecord = function PM_startRecord() {
    this.memoryProfiler.startProfiler();
  };

  ProfilerManager.prototype.stopRecord = function PM_stopRecord() {
    this.memoryProfiler.stopProfiler();
  };

  ProfilerManager.prototype.getProfileResults  = 
  function PM_getProfileResults () {
    this.PR = {};
    this.PR.names = this.memoryProfiler.getFrameNameTable(window);
    this.PR.traces = this.memoryProfiler.getStacktraceTable(window);
    this.PR.allocated = this.memoryProfiler.getAllocatedEntries(window);
    this.dispatchEvent('dataReady');
  };

  ProfilerManager.prototype.example1 = function example1() {
    var names = this.PR.names,
        traces = this.PR.traces,
        allocated = this.PR.allocated;
    var hist = [];
    var t, e, i, j;
    
    for (i = 0; i < names.length; i++) {
      hist[i] = {selfSize: 0, totalSize: 0, nameIdx: i};
    }
    
    for (i = 0; i < allocated.length; i++) {
      var visited = [];
      e = allocated[i];
      t = traces[e.traceIdx];
      hist[t.nameIdx].selfSize += e.size;
      for (j = e.traceIdx; j != 0; j = traces[j].parentIdx) {
        t = traces[j];
        if (!visited[t.nameIdx]) {
          visited[t.nameIdx] = true;
          hist[t.nameIdx].totalSize += e.size;
        }
      }
    }
    
    hist.sort(function(a,b) {return b.selfSize - a.selfSize;});
    
    console.log("    SelfSize   TotalSize  Name");
    for (i = 0; i < 20 && i < hist.length; i++) {
      console.log("%12.0f%12.0f  %s", hist[i].selfSize, hist[i].totalSize, names[hist[i].nameIdx]);
    }
  };

  ProfilerManager.prototype.example2 = function example2() {
    var names = this.PR.names,
        traces = this.PR.traces,
        allocated = this.PR.allocated;
    var hist = [];
    var t, e, i, j;
    
    for (i = 0; i < names.length; i++) {
      hist[i] = {selfAccu: 0, totalAccu: 0, nameIdx: i};
    }
    
    for (i = 0; i < allocated.length; i++) {
      var visited = [];
      e = allocated[i];
      t = traces[e.traceIdx];
      if (e.size > 0) {
        hist[t.nameIdx].selfAccu += e.size;
        for (j = e.traceIdx; j != 0; j = traces[j].parentIdx) {
          t = traces[j];
          if (!visited[t.nameIdx]) {
            visited[t.nameIdx] = true;
            hist[t.nameIdx].totalAccu += e.size;
          }
        }
      }
    }
    
    hist.sort(function(a,b) {return b.selfAccu - a.selfAccu;});
    
    console.log("    SelfAccu   TotalAccu  Name");
    for (i = 0; i < 20 && i < hist.length; i++) {
      console.log("%12.0f%12.0f  %s", hist[i].selfAccu, hist[i].totalAccu, names[hist[i].nameIdx]);
    }
  };

  // XXX should be rename
  ProfilerManager.prototype.example3 = function PM_example3() {
    var names = this.PR.names,
        traces = this.PR.traces,
        allocated = this.PR.allocated;
    var hist = [];
    var t, e, i, j;
    
    for (i = 0; i < names.length; i++) {
      hist[i] = {selfSize: 0, totalSize: 0, selfHWM: 0, totalHWM: 0, nameIdx: i};
    }
    
    for (i = 0; i < allocated.length; i++) {
      var visited = [];
      e = allocated[i];
      t = traces[e.traceIdx];
      hist[t.nameIdx].selfSize += e.size;
      if (hist[t.nameIdx].selfSize > hist[t.nameIdx].selfHWM) {
        hist[t.nameIdx].selfHWM = hist[t.nameIdx].selfSize;
      }
      for (j = e.traceIdx; j != 0; j = traces[j].parentIdx) {
        t = traces[j];
        if (!visited[t.nameIdx]) {
          visited[t.nameIdx] = true;
          hist[t.nameIdx].totalSize += e.size;
          if (hist[t.nameIdx].totalSize > hist[t.nameIdx].totalHWM) {
            hist[t.nameIdx].totalHWM = hist[t.nameIdx].totalSize;
          }
        }
      }
    }
    
    hist.sort(function(a,b) {return b.selfHWM - a.selfHWM;});
    
    console.log("     SelfHWM    TotalHWM  Name");
    for (i = j = 0; j < 20 && i < hist.length; i++) {
      // if (names[hist[i].nameIdx].search(/gbemu/) != -1) {
      // }
      console.log("%12.0f%12.0f  %s", hist[i].selfHWM, hist[i].totalHWM, names[hist[i].nameIdx]);
      j++;
    }
  };

  ProfilerManager.prototype.getHistogram = function PM_getHistogram() {
    var names = this.PR.names,
        traces = this.PR.traces,
        allocated = this.PR.allocated;
    var hist = [];
    var t, e, i, j;
    
    for (i = 0; i < names.length; i++) {
      hist[i] = {selfAccu: 0, totalAccu: 0, selfSize: 0, totalSize: 0,
                 selfHWM: 0, totalHWM: 0, nameIdx: i};
    }
    
    for (i = 0; i < allocated.length; i++) {
      var visited = [];
      e = allocated[i];
      t = traces[e.traceIdx];
      if (e.size > 0) {
        hist[t.nameIdx].selfAccu += e.size;
      }

      hist[t.nameIdx].selfSize += e.size;
      if (hist[t.nameIdx].selfSize > hist[t.nameIdx].selfHWM) {
        hist[t.nameIdx].selfHWM = hist[t.nameIdx].selfSize;
      }
      for (j = e.traceIdx; j != 0; j = traces[j].parentIdx) {
        t = traces[j];
        if (!visited[t.nameIdx]) {
          visited[t.nameIdx] = true;
          hist[t.nameIdx].totalSize += e.size;
          if (e.size > 0) {
            hist[t.nameIdx].totalAccu += e.size;
          }
          if (hist[t.nameIdx].totalSize > hist[t.nameIdx].totalHWM) {
            hist[t.nameIdx].totalHWM = hist[t.nameIdx].totalSize;
          }
        }
      }
    }
    
    return hist;
  };

  ProfilerManager.prototype.dispatchEvent = 
  function PM_dispatchEvent(name, detail) {
    var evt = new CustomEvent(name, { 'detail': detail});
    window.dispatchEvent(evt);
  };

  ProfilerManager.prototype.stop = function PM_stop() {
    this.PR = {};
  };
  exports.ProfilerManager = ProfilerManager;
}(window));

