'use strict';
(function(exports) {
  function Hub (option) {
    this.startButton = document.getElementById(option.startRecord);
    this.stopButton = document.getElementById(option.stopRecord);
    this.infoTable = document.getElementById(option.infoTable);
    this.profilerManager = option.profilerManager;
  }

  Hub.prototype = {
    start: function HUB_start () {
      this.startButton.addEventListener('click', this.startRecord.bind(this));
      this.stopButton.addEventListener('click', this.stopRecord.bind(this));
      window.addEventListener('dataReady', this.showInfo.bind(this));
    },

    startRecord: function HUB_startRecord(evt) {
      this.profilerManager.startRecord();
      this.showLoading();
    },

    stopRecord: function HUB_stopRecord(evt) {
      this.profilerManager.stopRecord();
      this.profilerManager.getProfileResults();
    },

    showLoading: function HUB_showLoading(evt) {
      this.infoTable.textContent = 'loading.....';
    },

    showInfo: function HUB_showInfo(evt) {
      this.infoTable.textContent = 'done!!!';
    },

    stop: function HUB_stop() {
      this.startButton.removeEventListener('click', this.startRecord);
      this.stopButton.removeEventListener('click', this.stopRecord);
      window.removeEventListener('dataReady', this.showInfo);
    }
  };
  exports.Hub = Hub;
}(window));
