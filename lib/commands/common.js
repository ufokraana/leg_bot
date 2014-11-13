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

			var streamStrings = [];

			streamNames.forEach(function(name){

				if(!streams[name]){
					return;
				}

				var game = streams[name].game || "Something???"

				if(this.channel.isBotMod()){
					streamStrings.push("http://twitch.tv/" + name + " playing " + game);
				}
				else{	
					streamStrings.push(name + " playing " + game);
				}
			}, this);

			if(streamStrings.length == 0){
				this.channel.say("No Awesome Channels currently live. :(");
				return;
			}

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

	'calendar': {
		time: 30,
		regex: /^calendar$/i,
		method: function(match, user, message){
			this.channel.say("You can find the Fan Stream calendar at: http://bit.ly/LRRFanStreamCalendar2");
		}
	},

	'lrr': {
		time: 30,
		regex: /^lrr$/i,
		method: function(match, user, message){
			this.channel.say("For awesome video content and streams, check out: http://www.loadingreadyrun.com");
		}
	},

	'db': {
		time: 30,
		regex: /^(db|desertbus)$/,
		method: function(match, user, message){
			this.channel.say("Desert Bus for Hope ( www.desertbus.org ) is a charity telethon run every November by Loading Ready Run and friends, in support of Child's Play Charity. They play Desert Bus, the most boring video game ever created. See this video for more information: http://youtu.be/aq5zv3I9hxQ This year's marathon will begin Nov. 14th at 10AM PST");
		},
	}
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
