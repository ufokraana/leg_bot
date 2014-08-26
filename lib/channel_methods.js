"use strict";

var log = require('../log.js');

var modules = require('./modules');

var client = require('../client.js');

//We store methods here and pass them to the model.
var c = module.exports = {};

//This gets called when the channel is actually joined
c.onJoinIRC = function(){

	this.bindLog();

	//We use these to keep track of mod status of users.
	//Every time twitch unmods someone we actually wait for 30 seconds
	//because twitch keeps modding and unmodding all the time.
	this.mods = {};
	this.modTimeouts = {};

	this.commandModules = [];
	this.attachModules();
}

c.bindLog = function(){
	this.log = {};

	this.log.log = log.log.bind(log, "C:", this.name);
	this.log.debug = log.debug.bind(log, "C:", this.name);
	this.log.error = log.error.bind(log, "C:", this.name);
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
	this.log.debug("twitch claims that", user, "is not a mod anymore");
	this.modTimeouts[user] = setTimeout(function(){
		me.log.log(user, "is not a mod anymore");
		me.mods[user] = false;
	}, 30000);
}

//This attach all the command modules that are enabled for the channel;
c.attachModules = function(){
	this.commandModules.push(new modules.common(this));
	this.attachModule(modules.common);
}

c.attachModule = function(constructor){
	var exists = this.commandModules.some(function(m){
		return m instanceof constructor;
	});

	if(!exists){
		this.commandModules.push(new constructor(this));
	}
}

//This gets called with every message sent to the channel
c.onMessage = function(user, message){
	//If it is something we said ourselves or not a command, we skip it.
	if(user == 'leg_bot' || message[0] != '!'){
		return;
	}
	
	for(var i=0, l=this.commandModules.length; i<l; i++){
		if(this.commandModules[i].onCommand(user, message.substr(1, message.length))){
			return;
		}
	}
}

//This is what command modules call to say stuff in the channel.
c.say = function(message){
	this.log.log("Saying:", message);
	client.client.say("#" + this.values.name, message);
}


