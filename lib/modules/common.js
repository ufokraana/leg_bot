
var CM = require('../commandmodule.js');

var CommonModule = module.exports = function(channel){
	CM.call(this, "Bot", channel);

}

CM.adopt(CommonModule);

var c = CommonModule.prototype;

c.baseCommands = {

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
