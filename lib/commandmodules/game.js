"use strict";

var CM = require('../commandmodule.js');

var GameModule = module.exports = function(channel){
	CM.call(this, "game", channel);

	this.game = undefined;
	this.overridden = false;
	
	this.settings = {};
	this.settingsWhereBindings = [this.channel.name];
	this.initSettings();
}

CM.adopt(GameModule);

var g = GameModule.prototype;

g.settingsTable = "game_settings";
g.settingsWhere = "channel = ?";
g.settingsDefinition = require('./gamesettings.js');



g.commands = {

}
