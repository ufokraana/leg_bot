"use strict";

//This keeps track of a single statistic in a channel.

var Q = require('q');
var db = require('../../db.js');

var Statistic = module.exports = function(commandSet, def){
	//We set all kinds of stuff, so we can access without too many .s
	//Also, we unpack the definition object.
	this.definition = def;
	this.commandSet = commandSet;
	this.log = commandSet.log;

	this.channel = commandSet.channel;

	this.name = def.name;
	this.count = def.count;
	this.countPlural = def.count_plural;

	this.bindCommands();

}

var s = Statistic.prototype;

s.bindCommands = function(){
	var cmds = this.commandSet.commands;

	cmds[this.name + 'count'] = {
		regex: new RegExp("^" + this.name + "count$", "i"),
		time: 30,
		method: this.sayCountMessage.bind(this)
	}
}

//Says the ammount of named stat we have for the current game.
//Longmessage tells us if we should prepend and append the cutesy messages
//associated with the stat.
s.sayCountMessage = function(longMessage){
	var game = this.commandSet.getGame();

	if(!game){
		this.commandSet.sayNoGame();
		return;
	}

	var say = function(value){
		if(longMessage){

		}
		else{
			this.channel.sayStatic(this.buildShortMessage(value));
		}
	}

	var promise = this.getValue();
	promise.then(say.bind(this));
	promise.fail(this.log.error);
}

//Gets the value of this statistic for the current game;
s.getValue = function(){
	var game = this.commandSet.getGame();
	if(!game){
		return Q.reject("Not playing a game");
	}
	
	return db.get(
		"SELECT value FROM game_stats_values WHERE channel = ? AND game = ? AND name = ?",
		[this.channel.name, game, this.name]
	);
}

//Creates a message that informs us of the value of this statistic.
s.buildShortMessage = function(value){

	this.log.debug("buildShortMessage got", value);

	if(value instanceof Object){
		value = value.value || 0;
	}

	if(isNaN(value)){
		return this.log.error("buildShortMessage called with NaN");
	}

	var template = "%value% %count% for %game%";
	var count = this.countPlural;
	if(value == 1){
		count = this.count || this.name;
	}

	template = template.replace('%value%', value);
	template = template.replace('%count%', count);
	template = template.replace('%game%', game);

	return template;
}


/*
//Modifies a stat
g.modifyStat = function(definition, delta, cb){
	var game = this.getGame();
	if(!game){
		return;
	}

	if(!delta){
		return;
	}

	if(!(cb instanceof Function)){
		cb = function(){};
	}

	this.log.log("Modifying", definition.name, "count for", game, "by", delta);

	var onStat = function(value){
		this.setStat(definition, value + delta, cb);
	}

	this.getStat(definition, onStat.call(this));
}

//Sets a stat
g.setStat = function(definition, value, cb){

	var game = this.getGame();

	if(!game){
		this.log.error("Trying to set stat", definition.name, "whilst no game is playing");
		return;
	}

	if(isNaN(value)){
		this.log.error("Trying to set stat", definition.name, "to", value);
		return;
	}

	this.log.debug("Setting", definition.name, "to", value);
	
	if(!(cb instanceof Function)){
		cb = function(){};
	}

	db.run(
		"INSERT OR REPLACE INTO game_stats_values VALUES (?, ?, ?, ?)",
		[this.channel.name, definition.name, game, value + delta],
		cb
	);

}

g.incrementStat = function(definition){
	var cb = function(){
		this.sayStat(definition, true);
	}
	this.modifyStat(definition, 1, cb.bind(this));
}

*/
