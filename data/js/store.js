'use strict';

(function(exports) {
  function Store() {
    this.names = null;
    this.traces = null;
    this.allocated = null;
    this.treeData = {};
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
          selfPeak: 0, totalPeak: 0,
          nameIdx: i};
      }
    },

    // XXX should be rename
    example1: function s_example1() {
      var names = this.names,
          traces = this.traces,
          allocated = this.allocated,
          hist = this.uniData;
      var t, e, i, j, len;
      
      for (i = 0, len = allocated.length; i < len; i++) {
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
      var t, e, i, j, len;
      
      for (i = 0, len = allocated.length; i < len; i++) {
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
      var t, e, i, j, len;
      
      for (i = 0, len = allocated.length; i < len; i++) {
        var visited = [];
        e = allocated[i];
        t = traces[e.traceIdx];
        hist[t.nameIdx].selfSize += e.size;
        if (hist[t.nameIdx].selfSize > hist[t.nameIdx].selfPeak) {
          hist[t.nameIdx].selfPeak = hist[t.nameIdx].selfSize;
        }
        for (j = e.traceIdx; j != 0; j = traces[j].parentIdx) {
          t = traces[j];
          if (!visited[t.nameIdx]) {
            visited[t.nameIdx] = true;
            hist[t.nameIdx].totalSize += e.size;
            if (hist[t.nameIdx].totalSize > hist[t.nameIdx].totalPeak) {
              hist[t.nameIdx].totalPeak = hist[t.nameIdx].totalSize;
            }
          }
        }
      }

      hist.sort(function(a,b) {return b.selfPeak - a.selfPeak;});

      console.log("     SelfPeak    TotalPeak  Name");
      for (i = j = 0; j < 20 && i < hist.length; i++) {
        // if (names[hist[i].nameIdx].search(/gbemu/) != -1) {
        // }
        console.log("%12.0f%12.0f  %s", hist[i].selfPeak, hist[i].totalPeak, names[hist[i].nameIdx]);
        j++;
      }
    },

    getHistogram: function s_getHistogram() {
      var names = this.names,
          traces = this.traces,
          allocated = this.allocated,
          hist = this.uniData;
      var t, e, i, j, len;

      for (i = 0, len = allocated.length; i < len; i++) {
        var visited = [];
        e = allocated[i];
        t = traces[e.traceIdx];
        if (typeof hist[t.nameIdx] === 'undefined') {
          continue;
        }
        if (e.size > 0) {
          hist[t.nameIdx].selfAccu += e.size;
        }

        hist[t.nameIdx].selfSize += e.size;
        if (hist[t.nameIdx].selfSize > hist[t.nameIdx].selfPeak) {
          hist[t.nameIdx].selfPeak = hist[t.nameIdx].selfSize;
        }
        for (j = e.traceIdx; j != 0; j = traces[j].parentIdx) {
          t = traces[j];
          if (!visited[t.nameIdx] && typeof hist[t.nameIdx] !== 'undefined') {
            visited[t.nameIdx] = true;
            hist[t.nameIdx].totalSize += e.size;
            if (e.size > 0) {
              hist[t.nameIdx].totalAccu += e.size;
            }
            if (hist[t.nameIdx].totalSize > hist[t.nameIdx].totalPeak) {
              hist[t.nameIdx].totalPeak = hist[t.nameIdx].totalSize;
            }
          }
        }
      }

      return hist;
    },

    getTreeData: function s_getTreeData() {
      var names = this.names;
      var traces = this.traces;
      var allocated = this.allocated;
      var treeData = this.treeData;

      var v = [];
      var t, e, f, r, i, len;
      for (i = 0, len = allocated.length; i < len; i++) {
        e = allocated[i];
        t = traces[e.traceIdx];
        if (v.indexOf(e.traceIdx) < 0) {
          f = [];
          r = [];
          v.push(e.traceIdx);
          f.push(t.nameIdx);
          r.push(e.traceIdx);
          r.push(t.parentIdx);
          while (t.parentIdx !== 0) {
            t = traces[t.parentIdx];
            f.push(t.nameIdx);
            r.push(t.parentIdx);
          }
          r.pop();

          if (t.nameIdx === 0) {
            this._treeAddRoot(names[0]);
          } else {
            this._treeAddChild(f, r);
          }
        } else {
          // FIXME: update allocate size here?
        }
      }

      return treeData;
    },

    _treeAddRoot: function s__treeAddRoot(rootName) {
      this.treeData.root = new Node({
        name: rootName,
        nameIdx: 0,
        parentIdx: 0
      });
    },

    _treeAddChild: function s__treeAddChild(functionNames, tracesInfo) {
      var names = this.names;
      var currentNode = this.treeData.root;
      for (var i = functionNames.length - 1; i >=0; i--) {
        var nodeOption = {
          name: names[functionNames[i]],
          nameIdx: functionNames[i],
          traceIdx: tracesInfo[i]
        };
        currentNode = currentNode.addChild(nodeOption);
      }
    }
  };

  function Node(options) {
    this.name = options.name;
    this.nameIdx = options.nameIdx;
    this.traceIdx = [options.traceIdx];
    this.children = [];
    this.parent = null;
    this.matrix = {
      selfSize: options.selfSize || 0,
      selfAccu: options.selfAccu || 0,
      selfPeak: options.selfPeak || 0,
      totalSize: options.totalSize || 0,
      totalAccu: options.totalAccu || 0,
      totalPeak: options.totalPeak || 0
    };
  }

  Node.prototype = {
    findChildrenByNameIdx: function(nameIdx) {
      for (var i in this.children) {
        if (this.children[i].nameIdx === nameIdx) {
          return this.children[i];
        }
      }
      return null;
    },

    addChild: function(nodeOption) {
      var childNode = this.findChildrenByNameIdx(nodeOption.nameIdx);
      if (childNode) {
        // Already has node, update child node traceIdx array
        childNode.traceIdx.push(nodeOption.traceIdx);
        // FIXME: update allocate size here?
      } else {
        // Node not exist, push new node
        childNode = new Node(nodeOption);
        childNode.parent = this;
        this.children.push(childNode);
      }
      return childNode;
    },

    updateChild: function(nodeOption) {
      // FIXME: To be determined
      this.matrix.selfSize += nodeOption.matrix.selfSize;
      this.matrix.selfAccu += nodeOption.matrix.selfAccu;
      this.matrix.selfPeak += nodeOption.matrix.selfPeak;
      this.matrix.totalSize += nodeOption.matrix.totalSize;
      this.matrix.totalAccu += nodeOption.matrix.totalAccu;
      this.matrix.totalPeak += nodeOption.matrix.totalPeak;
    },

    walk: function(visited, depth) {
      // XXX: Remove this when UI ready
      var indent = [];
      for (var d = 0; d < depth; d++) {
        indent.push('');
      }
      console.log(indent.join('  ') + this.name);
      // XXX: Remove this when UI ready
      visited.push(this.nameIdx);
      if (this.children.length > 0) {
        for (var i in this.children) {
          this.children[i].walk(visited, depth + 1);
        }
      }
    }
  };

  exports.Store = Store;
}(window));
