'use strict';
(function(exports) {
  function TreeManager() {
    // this.getMemoryResult();
    // this.constructUsage();
    // this.constructTrace();
    // this.display();
    this.getTreeView();
    this.display();
  }

  TreeManager.prototype = {
    getTreeView: function() {
      var names = navigator.memprofiler.getFrameNameTable();
      var traces = navigator.memprofiler.getStacktraceTable();
      var allocated = navigator.memprofiler.getAllocatedEntries();

      var v = [];
      var t, e, f, r, i;
      for (i = 0; i < allocated.length; i++) {
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

          if (t.nameIdx == 0 && t.parentIdx == 0) {
            this.addRoot(names[0]);
          } else {
            this.addChild(f, r);
          }
        } else {
          // update allocate trace
        }
      }
    },

    addRoot: function(rootName) {
      this.root = new Node({
        name: rootName,
        nameIdx: 0,
        parentIdx: 0
      });
    },

    addChild: function(functionNames, traceInfo) {
      var names = navigator.memprofiler.getFrameNameTable();
      var currentNode = this.root;
      for (var i = functionNames.length - 1; i >=0; i--) {
        var nextNode = new Node({
          name: names[functionNames[i]],
          nameIdx: functionNames[i],
          traceIdx: traceInfo[i]
        });
        currentNode = currentNode.addChild(nextNode);
      }
    },

    display: function() {
      this.root.walk([], 1);
    }
  };

  /*TreeManager.prototype.getMemoryResult = function() {
    var memoryResult = {
      frameNameTable: navigator.memprofiler.getFrameNameTable(),
      stacktraceTable: navigator.memprofiler.getStacktraceTable(),
      allocatedEntries: navigator.memprofiler.getAllocatedEntries(),
      tracesInfo: []
    }
    this.memoryResult = memoryResult;
  };

  TreeManager.prototype.getTracesInfo = function(traceIdx) {
    var traceInfo = null;
    var item = null;
    for (var i in this.memoryResult.tracesInfo) {
      item = this.memoryResult.tracesInfo[i];
      if (traceIdx === item.traceIdx ) {
        traceInfo = item;
        break;
      }
    }
    return traceInfo;
  };

  TreeManager.prototype.constructUsage = function() {
    var traceEntry = null;
    var tracesInfo = null;
    var allocateEntry = null;
    for (var i in this.memoryResult.allocatedEntries) {
      allocateEntry = this.memoryResult.allocatedEntries[i];
      traceEntry = this.memoryResult.stacktraceTable[allocateEntry.traceIdx];
      tracesInfo = this.getTracesInfo(allocateEntry.traceIdx);
      if (tracesInfo === null) {
        tracesInfo = {
          traceIdx: allocateEntry.traceIdx,
          parentIdx: traceEntry.parentIdx,
          sizeInfo: []
        };
        tracesInfo.sizeInfo.push(allocateEntry.size);
        this.memoryResult.tracesInfo.push(tracesInfo);
      } else {
        // update sizeInfo
        tracesInfo.sizeInfo.push(allocateEntry.size);
      }
    }
  };

  TreeManager.prototype.constructTrace = function() {
    for (var i in this.memoryResult.tracesInfo) {
      var entry = this.memoryResult.tracesInfo[i];
      var trace = this.memoryResult.stacktraceTable[entry.traceIdx];
      entry.fnName = [];
      // entry.traces = [];
      entry.fnName.push(trace.nameIdx);
      // entry.traces.push(entry.traceIdx);
      // entry.traces.push(trace.parentIdx);
      while (trace.parentIdx !== 0) {
        trace = this.memoryResult.stacktraceTable[trace.parentIdx];
        entry.fnName.push(trace.nameIdx);
        // entry.traces.push(trace.parentIdx);
      }
      // entry.traces.pop();

      if (entry.traceIdx == 0 && entry.parentIdx == 0) {
        this.addRoot();
      } else {
        this.addChild(entry);
      }
    }
  };

  TreeManager.prototype.addRoot = function() {
    var root = new Node({
      name: this.memoryResult.frameNameTable[0],
      nameIdx: 0,
      traceIdx: 0
    });
    this.root = root;
  };

  TreeManager.prototype.addChild = function(entry) {
    // console.log('addChild', entry.fnName);
    var names = entry.fnName;
    // var traces = entry.traces;

    var currentNode = this.root;
    for(var i = names.length - 1; i >= 0; i--) {
      var nextNode = new Node({
        name: this.memoryResult.frameNameTable[names[i]],
        nameIdx: names[i]
        // traceIdx: traces[i]
      });
      currentNode = currentNode.addChild(nextNode);
      // console.log('addChild nameIdx: ', nextNode.nameIdx);
      // currentNode = nextNode;
    }
  };

  TreeManager.prototype.display = function() {
    this.root.walk([], 0);
  };*/

  function Node(options) {
    if (!this.traceIdx) {
      this.traceIdx = [];
    }
    this.name = options.name;
    this.nameIdx = options.nameIdx;
    this.traceIdx.push(options.traceIdx);
    this.children = [];
    this.parent = null;
    this.matrix = {
      selfSize: null,
      selfAccu: null,
      selfPeak: null,
      totalSize: null,
      totalAccu: null,
      totalPeak: null
    };
  }

  Node.prototype.findChildren = function(nameIdx) {
    for (var i in this.children) {
      if (this.children[i].nameIdx === nameIdx) {
        return this.children[i];
      }
    }
    return null;
  };

  Node.prototype.addChild = function(node) {
    var childNode = this.findChildren(node.nameIdx);
    if (childNode) {
      // FIXME: should update node matrix
      childNode.traceIdx.push(node.traceIdx[0]);
      return childNode;
    } else {
      node.parent = this;
      this.children.push(node);
      return node;
    }
  };

  Node.prototype.updateChild = function(node) {
    this.matrix.selfSize += node.matrix.selfSize;
    this.matrix.selfAccu += node.matrix.selfAccu;
    this.matrix.selfPeak += node.matrix.selfPeak;
    this.matrix.totalSize += node.matrix.totalSize;
    this.matrix.totalAccu += node.matrix.totalAccu;
    this.matrix.totalPeak += node.matrix.totalPeak;
  };

  Node.prototype.walk = function(visited, depth) {
    var indent = [];
    for (var i = 0; i < depth; i++) {
      indent.push('');
    }
    console.log(indent.join('  ') + this.name);
    visited.push(this.traceIdx);
    if (this.children.length > 0) {
      for (var i in this.children) {
        this.children[i].walk(visited, depth + 1);
      }
    }
  };

  exports.TreeManager = TreeManager;
}(window));