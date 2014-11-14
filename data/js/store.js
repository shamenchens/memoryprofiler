'use strict';

(function(exports) {
  function Store() {
    this.names = null;
    this.traces = null;
    this.allocated = null;
    this.uniData = [];
    this.init();
  }

  Store.prototype = {
    init: function s_init() {
      window.addEventListener('search', this);
    },

    handleEvent: function s_handleEvent(evt) {
      switch(evt.type) {
        case 'search':
          console.log(evt.detail.term.length);
          break;
      }
    },

    create: function s_create(names, traces, allocated) {
      this.names = names;
      this.traces = traces;
      this.allocated = allocated;
      this.preprocessData();
      // notify others data is ready
      window.dispatchEvent(new CustomEvent('dataReady'));
    },

    drop: function s_drop() {
      this.names = null;
      this.traces = null;
      this.allocated = null;
      this.uniData = null;
    },

    preprocessData: function s_preprocessData() {
      var names = this.names,
          traces = this.traces,
          allocated = this.allocated,
          hist = this.uniData;
      var t, e, i, j;

      for (i = 0; i < names.length; i++) {
        hist[i] = {
          selfAccu: 0, totalAccu: 0,
          selfSize: 0, totalSize: 0,
          selfHWM: 0, totalHWM: 0,
          nameIdx: i};
      }
    },

    // XXX should be rename
    example1: function s_example1() {
      var names = this.names,
          traces = this.traces,
          allocated = this.allocated,
          hist = this.uniData;
      var t, e, i, j;
      
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
    },

    // XXX should be rename
    example2: function s_example2() {
      var names = this.names,
          traces = this.traces,
          allocated = this.allocated,
          hist = this.uniData;
      var t, e, i, j;
      
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
    },

    // XXX should be rename
    example3: function s_example3() {
      var names = this.names,
          traces = this.traces,
          allocated = this.allocated,
          hist = this.uniData;
      var t, e, i, j;
      
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
    },

    getHistogram: function s_getHistogram() {
      var names = this.names,
          traces = this.traces,
          allocated = this.allocated,
          hist = this.uniData;
      var t, e, i, j;
      
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
    }
  };

  exports.Store = Store;
}(window));
