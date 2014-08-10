"use strict";

var CM = require('../commandmodule.js');

var GameModule = module.exports = function(channel){
	CM.call(this, "game", channel);

	this.game = undefined;
}

CM.adopt(GameModule);

var g = GameModule.prototype;

g.commands = {
	"^!game": function(user, match, message){
		var message = "Currently playing: " + this.game;

		if(!this.game){
			message = "Not currently playing a game";
		}

		this.channel.say(message);
	},
}
