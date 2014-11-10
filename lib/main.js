'use strict';
var addontab = require("sdk/addon-page");
var data = require("sdk/self").data;
var tabs = require("sdk/tabs");
var buttons = require('sdk/ui/button/action');


var button = buttons.ActionButton({
  id: "Memory-Profiler",
  label: "Memory Profiler",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  onClick: handleClick
});

function handleClick(state) {
  tabs.open(data.url("index.html"));
}

