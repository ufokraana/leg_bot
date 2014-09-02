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

//This adds the command listeners to the commandSet that built this object.
s.bindCommands = function(){
	var cmds = this.commandSet.commands;

	cmds[this.name + 'count'] = {
		regex: new RegExp("^" + this.name + "count$", "i"),
		time: 30,
		method: this.sayCountMessage.bind(this)
	}

	cmds[this.name] = {
		regex: new RegExp("^" + this.name + "$", "i"),
		time: 30,
		method: this.increment.bind(this)
	}

	cmds[this.name + ' add'] = {
		regex: new RegExp("^" + this.name + " +add +(\\d+)$", "i"),
		modCommand: true,
		time: 30,
		method: this.modifyCommand.bind(this, 1)
	}
	
	cmds[this.name + ' remove'] = {
		regex: new RegExp("^" + this.name + " +remove +(\\d+)?$", "i"),
		modCommand: true,
		time: 30,
		method: this.modifyCommand.bind(this, -1)
	}

}

//Says the ammount of named stat we have for the current game.
//Longmessage tells us if we should prepend and append the cutesy messages
//associated with the stat.
s.sayCountMessage = function(longMessage){
	var game = this.commandSet.getGame();

	this.log.debug("Building message for", this.name);

	if(!game){
		this.commandSet.sayNoGame();
		return;
	}

	var templater = this.buildShortMessage;
	if(longMessage){

	}

	this.get()
		.then(templater.bind(this))
		.then(this.channel.say.bind(this.channel))
		.fail(this.log.error);
	
}

//Implements the "add" and "remove" stat commands
s.modifyCommand = function(direction, match, user, message){

	var ammount = match[1] || 1;

	ammount *= direction;

	this.mod(ammount)
		.then(this.sayCountMessage.bind(this, false))
		.fail(this.log.error);
}

s.setCommand = function(match, user, message){
	var ammount = match[1];
	if(isNaN(ammount)){
		return;
	}
}

//Increments the statistic count by one.
s.increment = function(){
	var game = this.commandSet.getGame();

	if(!game){
		this.commandSet.sayNoGame();
		return;
	}

	this.mod(1)
		.then(this.sayCountMessage.bind(this, true))
		.fail(this.log.error);
}
//Creates a message that informs us of the value of this statistic.
s.buildShortMessage = function(value){
	this.log.debug("buildShortMessage got", value);

	var template = "%value% %count% for %game%";
	var count = this.countPlural;
	if(value == 1){
		count = this.count || this.name;
	}
	var game = this.commandSet.getGame();
	if(!game){
		return this.log.error("buildShortMessage called without there being a game");
	}

	template = template.replace('%value%', value);
	template = template.replace('%count%', count);
	template = template.replace('%game%', game);

	return template;
}

//Gets the value of this statistic for the current game;
s.get = function(){
	var game = this.commandSet.getGame();
	if(!game){
		return Q.reject("Not playing a game");
	}

	this.log.debug("Querying DB for the value of", this.name);

	var parse = function(value){
		this.log.debug(this.name, "getValue got", value, "from DB");
		if(value instanceof Object){
			value = value.value;
		}

		if(isNaN(value)){
			value = 0;
		}

		return value;
	}

	return db.get(
		"SELECT value FROM game_stats_values WHERE channel = ? AND game = ? AND name = ?",
		[this.channel.name, game, this.name]
	).then(parse.bind(this));
}

//Sets the value of this statistic
s.set = function(value){
	if(isNaN(value)){
		return Q.reject(value, "is NaN");
	}

	var game = this.commandSet.getGame();
	if(!game){
		return Q.reject("Not playing a game");
	}

	return db.run(
		"INSERT OR REPLACE INTO game_stats_values VALUES (?, ?, ?, ?)",
		[this.channel.name, this.name, game, value]
	);
}

//Modifies the value of this statistic
s.mod = function(delta){
	if(isNaN(delta)){
		return Q.reject(delta, "is NaN");
	}

	var modify = function(value){
		return this.set(value + delta);
	}
	modify = modify.bind(this);

	return this.get().then(modify);
}
/*
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
