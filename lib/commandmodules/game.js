"use strict";

var CM = require('../commandmodule.js');

var GameModule = module.exports = function(channel){
	CM.call(this, "game", channel);
	
	this.gameOverride = undefined;

	this.settings = {};
	this.settingsWhereBindings = [this.channel.name];
	this.initSettings();
}

CM.adopt(GameModule);

var g = GameModule.prototype;

g.settingsTable = "game_settings";
g.settingsWhere = "channel = ?";
g.settingsDefinition = require('./gamesettings.js');

g.sayGame = function(){
	var game = this.gameOverride || this.channel.twitch.game;

	if(!game){
		this.channel.say("Not currently playing any game.");
	}
	else{
		this.channel.say("Currently playing: " + game);
	}

}

g.baseCommands = {
	'game': {
		regex: /^game$/i,
		time: 30,
		method: function(match, user, message){
			this.sayGame();
		}
	},

	'game override': {
		regex: /^game override *(.*)?/i,
		time: 5,
		modCommand: true,
		method: function(match, user, message){
			var game = match[1];
			if(!game || game.match(/off/i)){
				game = undefined;
			}

			this.gameOverride = game;
			this.log.log("Game overriden to", game);
			this.sayGame();
		}
	}
}
