'use strict';
(function(exports) {
  function TreeManager() {
    this.getTreeView();
    this.display();
  }

  TreeManager.prototype = {
    getTreeView: function() {
      var names = navigator.memprofiler.getFrameNameTable();
      var traces = navigator.memprofiler.getStacktraceTable();
      var allocated = navigator.memprofiler.getAllocatedEntries();
      this.addRoot(names[0]);

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

          if (t.nameIdx === 0) {
            this.addRoot(names[0]);
          } else {
            this.addChild(f, r);
          }
        } else {
          // FIXME: update allocate size here?
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

    addChild: function(functionNames, tracesInfo) {
      var names = navigator.memprofiler.getFrameNameTable();
      var currentNode = this.root;
      for (var i = functionNames.length - 1; i >=0; i--) {
        var nodeOption = {
          name: names[functionNames[i]],
          nameIdx: functionNames[i],
          traceIdx: tracesInfo[i]
        };
        currentNode = currentNode.addChild(nodeOption);
      }
    },

    display: function() {
      this.root.walk([], 1);
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

  exports.TreeManager = TreeManager;
}(window));