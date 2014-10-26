"use strict";

var twitch = require('../twitch.js');

var SimpleCommands = require('./simple_commands.js');

var CommonModule = module.exports = function(channel){
	SimpleCommands.call(this, channel);

}

SimpleCommands.adopt(CommonModule);

var c = CommonModule.prototype;

c.commands = {

	'live': {
		time: 30,
		regex: /^live$/i,
		method: function(match, user, message){
			var streams = twitch.getData();
			var streamNames = Object.keys(streams);
			if(streamNames.length == 0){
				this.channel.say("No Awesome Channels currently live. :(");
				return;
			}

			var streamStrings = [];

			streamNames.forEach(function(name){
				streamStrings.push(name + " playing " + streams[name].game);
			});

			streamStrings = streamStrings.join(", ");
			this.channel.say("Awesome Channels currently live: " + streamStrings);
		},
	},	
	'help': {
		time: 30,
		regex: /^h[aeuioy]lp$/i,
		method: function(match, user, message){
			this.channel.say(match[0] + ": " + "https://github.com/ufokraana/leg_bot/blob/master/README.md");
		}
	},
	'mods': {
		time: 30,
		regex: /^mods$/i,
		method: function(match, user, message){
			this.channel.say("Twitch reports the following mods: " + Object.keys(this.channel.mods).join(', '));
		}
	},

	'game': {
		time: 15,
		regex: /^game$/i,
		method: function(match, user, message){
			var game = this.channel.getGame();
			if(game){
				this.channel.say("Currently playing: " + game);
			}
			else{
				this.channel.say("Not currently playing any game");	
			}
		}
	},

	'game override': {
		time: 1,
		regex: /^game override *(.*)$/i,
		modOnly: true,
		method: function(match, user, message){
			var newGame = match[1] || "off";
			if(newGame.match(/off/i)){
				newGame = undefined;
			}
			this.channel.gameOverride = newGame;

			var game = this.channel.getGame();
			if(game){
				this.channel.say("Now playing: " + game);
			}
			else{
				this.channel.say("Not currently playing any game");	
			}

		}
	},
}
/*
//Test commands for trolling caffeinatedlemur's chatroom
b.commands['^!adult$'] = function(match, user, message){
	this.channel.say("All the available adults are horrible people.");
}
b.commands['^!advice$'] = function(match, user, message){
	this.channel.say("Rub your wanzer on all the things.");
}
*/
