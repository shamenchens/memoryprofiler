'use strict';
(function(exports) {
  function PadManager (option) {
    this._elements = option.elements;
    this.store = option.store;
  }

  PadManager.prototype = {
    start: function PL_start () {
      window.addEventListener('dataReady', this);
    },

    handleEvent: function PL_handleEvent(evt) {
      switch(evt.type) {
        case 'dataReady':
          this.drawTrace();
          break;
      }
    },

    setupCanvas: function PL_setupCanvas() {
      var baseWidth = 10;
      var tracePool = this.store.allocated;
      var traceCount = tracePool.length;
      if (traceCount > 0) {
        this._elements.pad.width = traceCount * baseWidth;
      }
      this._elements.pad.style.width = '100%';
    },

    drawTrace: function PL_drawTrace() {
      this.setupCanvas();
      var baseWidth = 10;
      var baseLine = 400;
      var ctx = this._elements.pad.getContext('2d');
      var tracePool = this.store.allocated;
      var start = baseLine - 40;
      ctx.strokeStyle = 'black';
      for (var i in tracePool) {
        var entry = tracePool[i];
        var entryHeight = (entry.size / 1024) * 10;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(10 + i * 10, baseLine);
        ctx.lineTo(10 + i * 10, baseLine - entryHeight);
        ctx.strokeStyle = '#000000';
        if (entryHeight < 0) {
          ctx.strokeStyle = '#00ff00';
        } 
        ctx.stroke();
        //ctx.strokeStyle = '#000000';
        if (i > 0) {
          ctx.moveTo(10 + (i - 1) * 10, start);
          ctx.lineTo(10 + i * 10, start - (entryHeight / 10) );
          //ctx.strokeStyle = '#000000';
          ctx.stroke();
        } 
        start = start - (entryHeight / 10);
      }
    },

    stop: function PL_stop() {
      window.removeEventListener('dataReady', this);
    }
  };
  exports.PadManager = PadManager;
}(window));
