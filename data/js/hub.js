'use strict';
(function(exports) {
  function Hub (option) {
    this.searchBar = document.getElementById(option.searchBar);
    this.startButton = document.getElementById(option.startRecord);
    this.stopButton = document.getElementById(option.stopRecord);
    this.infoTable = document.getElementById(option.infoTable);
    this.profilerManager = option.profilerManager;
  }

  Hub.prototype = {
    start: function HUB_start () {
      this.startButton.addEventListener('click', this);
      this.stopButton.addEventListener('click', this);
      this.searchBar.addEventListener('keyup', this);
      window.addEventListener('dataReady', this);
    },

    handleEvent: function HUB_handleEvent(evt) {
      switch (evt.type) {
        case 'click':
          if (evt.target === this.startButton) {
            this.startRecord();
          } else if (evt.target === this.stopButton) {
            this.stopRecord();
          }
          break;
        case 'dataReady':
          this.showInfo();
          break;
        case 'keyup':
          if (evt.target === this.searchBar) {
            this.search();
          }
          break;
        default:
          break;
      }
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
      this.startButton.removeEventListener('click', this);
      this.stopButton.removeEventListener('click', this);
      window.removeEventListener('dataReady', this);
    },

    search: function HUB_search() {
      console.log(this.searchBar.value.length);
    }
  };
  exports.Hub = Hub;
}(window));
