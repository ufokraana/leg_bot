
var SimpleCommands = require('./simple_commands.js');

var CommonModule = module.exports = function(channel){
	SimpleCommands.call(this, channel);

}

SimpleCommands.adopt(CommonModule);

var c = CommonModule.prototype;

c.commands = {

	'bot': {
		time: 30,
		regex: /^(leg_?)?bot/i,
		method: function(match, user, message){
			this.channel.say("Look at the cards: https://github.com/ufokraana/leg_bot");
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
