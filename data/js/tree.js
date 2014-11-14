'use strict';
(function(exports) {
  function TreeManager() {
    this.getMemoryResult();
    this.constructUsage();
    this.constructTrace();
  }

  TreeManager.prototype.getMemoryResult = function() {
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
      entry.trace = [];
      entry.fnName.push(trace.nameIdx);
      while (trace.parentIdx !== 0) {
        trace = this.memoryResult.stacktraceTable[trace.parentIdx];
        entry.fnName.push(trace.nameIdx);
      }
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
    var names = entry.fnName;
    var traceIdx = entry.traceIdx;

    var currentNode = this.root;
    for(var i = names.length - 1; i >= 0; i--) {
      var parentTraceIdx = names[i];
      var nextNode = new Node({
        name: this.memoryResult.frameNameTable[names[i]],
        nameIdx: names[i],
        traceIdx: parentTraceIdx
      });
      currentNode.addChild(nextNode);
      currentNode = nextNode;
    }
  };

  function Node(options) {
    this.name = options.name;
    this.nameIdx = options.nameIdx;
    this.traceIdx = options.traceIdx;
    this.children = [];
    this.matrix = {
      selfSize: null,
      selfAccu: null,
      selfPeak: null,
      totalSize: null,
      totalAccu: null,
      totalPeak: null
    }
  }

  Node.prototype.findChildren = function(traceIdx) {
    for (var child in this.children) {
      if (child.traceIdx === traceIdx) {
        return child;
      }
    }
    return null;
  };

  Node.prototype.addChild = function(node) {
    for (var child in this.children) {
      if (child.traceIdx === node.traceIdx) {
        child.updateChild(node);
        return;
      }
    }
    this.children.push(node);
  };

  Node.prototype.updateChild = function(node) {
    this.matrix.selfSize += node.matrix.selfSize;
    this.matrix.selfAccu += node.matrix.selfAccu;
    this.matrix.selfPeak += node.matrix.selfPeak;
    this.matrix.totalSize += node.matrix.totalSize;
    this.matrix.totalAccu += node.matrix.totalAccu;
    this.matrix.totalPeak += node.matrix.totalPeak;
  };

  exports.TreeManager = TreeManager;
}(window));