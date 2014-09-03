"use strict";

var log = require('../log.js');

var commands = require('./commands');
var models = require('./models.js');

var client = require('../client.js');

//These communicate between the irc client, command modules and database models.
var Channel = module.exports = function(model){
	
	this.model = model;
	this.hashtag = "#" + model.values.name;

	this.bindLog();

	//We use these to keep track of mod status of users.
	//Every time twitch unmods someone we actually wait for 30 seconds
	//because twitch keeps modding and unmodding all the time.
	this.mods = {};
	this.mods[model.values.name] = true; // The channel owner is always a mod.
	this.modTimeouts = {};

	this.commands = [];
	this.attachCommands();

	this.twitchData = {};
}

//Finds all active channels and builds channel objects out of them.
Channel.findActiveChannels = function(callback){

	var things = [];

	function buildChannels(models){
		models.forEach(function(m){
			things.push(new Channel(m));
		});

		if(callback instanceof Function){
			callback(things);
		}
	};

	models.Channel
		.findAll({where: ["active"]})
		.success(buildChannels);
}

var c = Channel.prototype;

//This gets called when the channel is actually joined

c.bindLog = function(){
	this.log = {};

	var name = this.model.values.name;

	this.log.log = log.log.bind(log, "C:", name);
	this.log.debug = log.debug.bind(log, "C:", name);
	this.log.error = log.error.bind(log, "C:", name);
}

//These get called when twitch tells us of somebody being modded or unmodded
//Because twitch is derpy we implement a timeout to removing mod status.
c.onUserModded = function(user){
	this.mods[user] = true;
	this.log.log("U:", user, "is now a mod");
	clearTimeout(this.modTimeouts[user]);
}
c.onUserUnmodded = function(user){
	var me = this;

	//We never demod the channel owner.
	if(user == this.model.values.name){
		return;
	}

	this.log.debug("twitch claims that", user, "is not a mod anymore");
	this.modTimeouts[user] = setTimeout(function(){
		me.log.log(user, "is not a mod anymore");
		me.mods[user] = false;
	}, 30000);
}

//This will attach all the command modules that are enabled for the channel;
c.attachCommands = function(){
	this.attachCommand(commands.common);
}

c.attachCommand = function(constructor){
	var exists = this.commands.some(function(m){
		return m instanceof constructor;
	});

	if(!exists){
		this.commands.push(new constructor(this));
	}
}

//This gets called with every message sent to the channel
c.onMessage = function(user, message){
	//If it is something we said ourselves or not a command, we skip it.
	if(user == 'leg_bot' || message[0] != '!'){
		return;
	}
	
	this.log.debug("Got something like a command:", user, message);

	for(var i=0, l=this.commands.length; i<l; i++){
		if(this.commands[i].onCommand(user, message.substr(1, message.length))){
			return;
		}
	}
}

//Returns wether an user is mod.
c.isMod = function(user){
	return this.mods[user] || user == this.model.values[name];
}

c.getGame = function(){
	return this.gameOverride || this.twitchData.game;
}

//This is what command modules call to say stuff in the channel.
c.say = function(message){
	this.log.log("Saying:", message);
	client.client.say(this.hashtag, message);
}


