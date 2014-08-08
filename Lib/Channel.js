/*
	A channel object interfaces between the command modules and the irc client.

	It registers itself using client.registerChannel. The client starts calling 'emit' when something happens in the channel.
	Command modules listen to these events and call the channel's methods to respond.
*/

var db = require('../db.js');
var client = require('../client.js');
var log = require('../log.js');

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;

var Channel = module.exports = function(name){
	this.name = name;
	this.bindLogger();

	client.registerChannel(name, this);

	this.modules = {};
	this.loadCommandModules();
}
inherits(Channel, EventEmitter);

var c = Channel.prototype;

c.bindLogger = function(){
	this.log = {};

	this.log.log = log.log.bind(log, "C:", this.name);
	this.log.debug = log.debug.bind(log, "C:", this.name);
	this.log.error = log.error.bind(log, "C:", this.name);
}

//loads command modules that the channel uses
c.loadCommandModules = function(){
	this.log.debug("Loading Modules");
	this.loadCommandModule("Bot");
}

//Loads a command module and attaches it to the channel.
c.loadCommandModule = function(name){
	if(this.modules[name]){
		this.log.error("Attempted to create module", name, "more than once.");
		return;
	}

	var CM = require("./CommandModules/" + name + ".js");

	this.modules[name] = new CM(this);
}

c.say = function(message){
	client.client.say(this.name, message);
}
