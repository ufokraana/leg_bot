//This is a set of commands for legbot to use.
//Each channel has its own instance of a CommandModule.

var db = require('../db.js');
var inherits = require('util').inherits;

var CommandModule = module.exports = function(name, channel){
	this.name = name;
	this.channel = channel;

	this.bindLogs();

	this.log.log("Starting up");	
	//This contains regexes and functions that resolve commands in pairs
	this.boundCommands = [];

	this.channel.on('message', this.onMessage.bind(this));
}

CommandModule.adopt = function(child){
	inherits(child, CommandModule);
}

var c = CommandModule.prototype;

c.bindLogs = function(){
	this.log = {};

	var log = this.channel.log;

	this.log.log = log.log.bind(log, "M:", this.name);
	this.log.debug = log.debug.bind(log, "M:", this.name);
	this.log.error = log.error.bind(log, "M:", this.name);
}

//Adds all the commands from prototype.commands to the module
c.bindCommands = function(){
	for(regex in this.commands){
		if(this.commands.hasOwnProperty(regex)){
			this.log.log("Binding", this.name,  regex, "for channel", this.channel.name);
			this.bindCommand(regex, this.commands[regex]);
		}
	}
}

//Adds a new regex and a response method to the module
c.bindCommand = function(regex, method){

	regex = RegExp(regex);
	regex.ignoreCase = true;
	method = method.bind(this);
	this.boundCommands.push([regex, method]);
}

//Reads messages and parses them against bound commands
c.onMessage = function(data){

	var message = data.message;
	var user = data.user;

	var log = this.log;
	log.debug("Parsing", message);
	this.boundCommands.forEach(function(binding){
		var regex = binding[0];
		var func = binding[1];

		var match = message.match(regex);
		
		if(match){
			log.log("U:", user, "CMD:", message);
			func(match, user, message);
		}
	});
}
