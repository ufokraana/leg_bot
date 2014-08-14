"use strict";

var CM = require('../commandmodule.js');
var Statistic = require('./game_statistic.js');
var db = require('../../db.js');
var Q = require('q');

var GameModule = module.exports = function(channel){
	
	this.channel = channel;

	this.gameOverride = undefined;
	this.settings = {};
	this.settingsWhereBindings = [this.channel.name];

	CM.call(this, "game", channel);
}

CM.adopt(GameModule);

var g = GameModule.prototype;

g.settingsTable = "game_settings";
g.settingsWhere = "channel = ?";
g.settingsDefinition = require('./game_settings.js');

//We query the DB for stats to use for this channel
g.initCommands = function(){
	CM.prototype.initCommands.call(this);

	var promise = db.all(
		"SELECT * FROM game_stats WHERE channel = ?",
		this.channel.name
	);
	
	promise.then(this.buildStatCommands.bind(this));
	promise.fail(this.log.error);
}

//Says what game we are playing.
g.sayGame = function(){
	var game = this.getGame();
	if(!game){
		this.sayNoGame();
	}
	else{
		this.channel.sayStatic("Currently playing: " + game);
	}

}

//Says that we are not playing a game
//(If we ever need to change this message, we can do this at a single spot)
g.sayNoGame = function(){
	this.channel.sayStatic("Not currently playing any game.");
}

//Checks game override, then twitch for what game we are playing.
g.getGame = function(){
	return this.gameOverride || this.channel.twitch.game;
}

//This builds the statistics commands based on a db row from game_stats
g.buildStatCommands = function(definitions){
	var sc = this.statControllers = {};

	definitions.forEach(function(def){
		sc[def.name] = new Statistic(this, def);
	}, this);
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
