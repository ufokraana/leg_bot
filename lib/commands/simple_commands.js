"use strict";

var inherits = require('util').inherits;

//This is for simple modules that implement a static commandset
var CommandSet = require('./commandset.js');

var SimpleCommands = module.exports = function(channel){
	CommandSet.call(this, channel);	
}

CommandSet.adopt(SimpleCommands);

SimpleCommands.adopt = function(constructor){
	inherits(constructor, SimpleCommands);
};

var sc = SimpleCommands.prototype;

sc.onCommand = function(user, command){
	if(!this.commands){
		return;
	}

	var keys = Object.keys(this.commands);

	var i, l;

	var name, command;

	for(i=0, l=keys.length; i<l; i++){
		name = keys[i];
		command = this.commands[name];
	}
};

