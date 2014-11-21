'use strict';

  (function(exports) {
    function MockMemProfiler(option) {
      this.status = 'init';
      this.init();
    }

    MockMemProfiler.prototype = {
      startProfiler: function MP_startProfiler(window) {
        if (this.status === 'profiling') {
          return;
        }
        this.status = 'profiling';
        // this.dispatchEvent('startprofiling');
        console.log('startProfiler...');
      },

      stopProfiler: function MP_stopProfiler(window) {
        if (this.status === 'idle') {
          return;
        }
        this.status = 'idle';
        // this.dispatchEvent('stopprofiling');
        console.log('stopProfiler...');
      },

      getFrameNameTable: function MP_getFrameNameTable(window){
        return this.getJSON('resource/names.json');
      },

      getStacktraceTable: function MP_getStacktraceTable(window){
        return this.getJSON('resource/traces.json');
      },

      getAllocatedEntries: function MP_getAllocatedEntries(window){
        return this.getJSON('resource/allocated.json');
      },

      getJSON: function MP_getJSON(url) {
        return new Promise(function(resolve, reject) {
          var xhr = new XMLHttpRequest();
          xhr.open('get', url, true);
          xhr.responseType = 'json';
          xhr.onload = function() {
            var status = xhr.status;
            if (status == 200) {
              resolve(xhr.response);
            } else {
              reject(status);
            }
          };

          // Handle network errors
          xhr.onerror = function(e) {
            console.log('error:' + e.error);
            reject(console.error('error'));
          };

          xhr.send();
        });
      },

      // dispatchEvent: function MP_dispatchEvent(name, detail) {
      //   var evt = new CustomEvent(name, { 'detail': detail});
      //   window.dispatchEvent(evt);
      // },

      init: function MP_init(){
        this.status = 'idle';
        console.log('init.....');
      },

      stop: function MP_stop(){
        this.status = 'init';
        console.log('stop.....');
      }
    };

    exports.MockMemProfiler = MockMemProfiler;
  }(window));
