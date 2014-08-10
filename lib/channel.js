/*
	A channel object interfaces between the command modules and the irc client.

	It registers itself using client.registerChannel. The client starts calling 'emit' when something happens in the channel.
	Command modules listen to these events and call the channel's methods to respond.
*/

"use strict";

var db = require('../db.js');
var client = require('../client.js');
var log = require('../log.js');

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;

var Settings = require('./settings.js');
var Twitch = require('./twitch.js');

var Channel = module.exports = function(name){
	this.name = name;
	this.hashtag = "#" + name;
	this.bindLogger();

	client.registerChannel(this.hashtag, this);

	this.modules = {};

	this.settings = {};
	this.settingsWhereBindings = [this.name];
	this.initSettings();

	this.twitch = {};

	this.queryTwitch();
}
inherits(Channel, EventEmitter);

var c = Channel.prototype;

Settings.inject(c);
Twitch.inject(c);

c.settingsTable = "channel_settings";
c.settingsWhere = "channel = ?";
c.settingsDefinition = require('./channelsettings.js');

//After we have the channel settings we load the command modules
c.onSettingsLoaded = function(){
	this.loadCommandModules();
}

c.bindLogger = function(){
	this.log = {};

	this.log.log = log.log.bind(log, "C:", this.name);
	this.log.debug = log.debug.bind(log, "C:", this.name);
	this.log.error = log.error.bind(log, "C:", this.name);
}

//loads command modules that the channel uses
c.loadCommandModules = function(){
	this.log.debug("Loading Modules");
	this.loadCommandModule("bot");

	var me = this;

	db.each(
		"SELECT module FROM channel_modules WHERE channel = ?",
		this.name,
		function(err, row){
			if(err){
				me.log.error("Got SQL error:", err);
			}
			else{
				me.loadCommandModule(row.module);
			}
		}
	);
}

//Loads a command module and attaches it to the channel.
c.loadCommandModule = function(name){
	if(this.modules[name]){
		this.log.debug("Module:", name, "already exists");
		return;
	}

	var CM;

	try{
		CM = require("./commandmodules/" + name + ".js");
	}
	catch(e){
		this.log.error("Couldnt load module", name, "got error:", e);
	}

	if(CM){	
		this.modules[name] = new CM(this);
	}
}

//This is what command modules call to say stuff in the channel.
c.say = function(message){
	this.log.log("Saying:", message);
	client.client.say(this.hashtag, message);
}
