'use strict';
(function(exports) {
  function TreeManager(option) {
    this.store = option.store;
  }

  TreeManager.prototype = {
    start: function tm_start() {
      window.addEventListener('dataReady', this);
    },

    stop: function tm_stop() {
      window.removeEventListener('dataReady', this);
    },

    handleEvent: function tm_handleEvent(event) {
      switch (event.type) {
        case 'dataReady':
          this.showTreeView();
          break;
        default:
          break;
      }
    },

    showTreeView: function tm_showTreeView() {
      var treeData = this.store.getTreeData();
      treeData.root.walk([], 1);
    }
  };

  exports.TreeManager = TreeManager;
}(window));
