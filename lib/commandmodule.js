//This is a set of commands for legbot to use.
//Each channel has its own instance of a CommandModule.

var db = require('../db.js');
var inherits = require('util').inherits;
var Settings = require('./settings.js');

var CommandModule = module.exports = function(name, channel){
	this.name = name;
	this.channel = channel;

	this.bindLogs();

	this.log.log("Starting up");
	
	//If we have a settings table we init settings
	//otherwise we skip to initializing commands
	if(this.settingsTable){
		this.initSettings();
	}
	else{
		this.initCommands();
	}
}

CommandModule.adopt = function(child){
	inherits(child, CommandModule);
}

var c = CommandModule.prototype;

Settings.inject(c);

c.bindLogs = function(){
	this.log = {};

	var log = this.channel.log;

	this.log.log = log.log.bind(log, "M:", this.name);
	this.log.debug = log.debug.bind(log, "M:", this.name);
	this.log.error = log.error.bind(log, "M:", this.name);
}

c.onSettingsLoaded = function(){
	this.initCommands();
}

//Creates a new commands object and copies commands over from the baseCommands object
c.initCommands = function(){
	this.commands = {};

	var base = this.baseCommands;

	Object.keys(base).forEach(function(name){
		this.commands[name] = base[name];
	}, this);
}

//Reads messages and parses them against commands
c.onMessage = function(user, message){
	Object.keys(this.commands).forEach(this.checkCommand.bind(this, user, message));
}

//Checks if a message matches a command
c.checkCommand = function(user, message, cmdName){
	var command = this.commands[cmdName];

	if(!(command instanceof Object)){
		this.log.error("Asked to check command", cmdName, "which does not exist");
		return;
	}

	//If the message does not match the command we can bail right now
	var match = message.match(command.regex);
	this.log.debug('Matching', message, 'with', command.regex, 'got', match);
	if(!match){
		return;
	}

	//We check to see if we are not triggering this command too ofter.
	var now = new Date;
	var lastTrigger = command.lastTrigger || 0;
	var delta = now - lastTrigger;
	if(command.time && delta < (command.time * 1000)){
		this.log.log(cmdName, "triggered too soon");
		return;
	}

	//If it is a mod only command and the user is not a mod we bail
	if(command.modCommand && !this.channel.mods[user] && user != this.channel.name){
		this.channel.sayStatic(user + ": That is a mod only command.");
		return;
	}

	command.lastTrigger = now;

	command.method.call(this, match, user, message);
};
