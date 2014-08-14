/*
	A channel object interfaces between the command modules and the irc client.

	It registers itself using client.registerChannel. The client starts calling 'emit' when something happens in the channel.
	Command modules listen to these events and call the channel's methods to respond.
*/

"use strict";

var db = require('../db.js');
var client = require('../client.js');
var log = require('../log.js');

var Settings = require('./settings.js');
var Twitch = require('./twitch.js');

var config = require('../config.js');

var Channel = module.exports = function(name){
	//The channel's name in both normal and IRC hashtag format
	this.name = name;
	this.hashtag = "#" + name;

	//We bind the logger to prepend the channel's name
	this.bindLogger();

	//We tell the IRC client to join the channel and start emitting our events
	client.registerChannel(this.hashtag, this);

	//We keep our command modules here
	this.modules = {};

	//We store channel mods here
	this.mods = {};

	//Because twitch constantly mods and unmods the mods
	//we keep their mod status for a while.
	//We set timeouts to remove the status and keep the ID here.
	//If the mod status is given back, we remove that timeout
	this.modTimeouts = {};

	//This is stuff for the settings module
	this.settings = {};
	this.settingsWhereBindings = [this.name];
	this.initSettings();

	//The twitch API queries store their parsed result here
	this.twitch = {};

	this.queryTwitch();
}

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

	var parse = function(rows){
		rows.forEach(function(row){
			this.loadCommandModule(row.module);
		}, this);
	}

	var promise = db.all(
		"SELECT module FROM channel_modules WHERE channel = ?",
		this.name
	);
	promise.then(parse.bind(this));
	promise.fail(this.log.error);


	db.each(
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

	CM = require("./commandmodules/" + name + ".js");

	if(CM){	
		this.modules[name] = new CM(this);
	}
}

//This gets called when the channel gets a message.
c.onMessage = function(user, message){
	//If the message does not start with !, we can ignore it
	if(message[0] != '!'){
		return;
	}

	this.log.log("Got command-like message:", message);

	//We strip the !
	message = message.substr(1, message.length);

	//We pass the message along to our command modules
	Object.keys(this.modules).forEach(function(m){
		this.modules[m].onMessage(user, message);
	}, this);
}

//These get called when twitch tells us of somebody being modded or unmodded
//Because twitch is derpy we implement a timeout to removing mod status.
c.onModded = function(user){
	this.mods[user] = true;
	this.log.log("U:", user, "is now a mod");
	clearTimeout(this.modTimeouts[user]);
}
c.onUnmodded = function(user){
	var me = this;
	this.modTimeouts[user] = setTimeout(function(){
		me.log.log(user, "is not a mode anymore");
		me.mods[user] = false;
	});
}

//This is what command modules call to say stuff in the channel.
c.say = function(message){
	this.log.log("Saying:", message);
	client.client.say(this.hashtag, message);
}

//This will be a way for modules to say static messages
//So twitch won't think of us as a spammer.
c.sayStatic = c.say;
