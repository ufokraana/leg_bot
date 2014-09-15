"use strict";

var CommandSet = require('./commandset.js');

var Models = require('../models.js');

var StatCommands = module.exports = function(channel){
	CommandSet.apply(this, arguments);
};

CommandSet.adopt(StatCommands);

var c = StatCommands.prototype;

c.onCommand = function(user, command){
	//We determine what the command would be, if it references a stat
	var cmdFunk, match, statName, value;

	if(match = command.match(/^(.*)count$/i)){
		cmdFunk = this.parrotStat.bind(this, user);
		statName = match[1];
	}
	else if(match = command.match(/^(.*) +set +(-?\d+)/i)){
		statName = match[1];
		var value = parseInt(match[2]);
		cmdFunk = this.setStat.bind(this, user, value);
	}
	else if(match = command.match(/^(.*) +(add|remove) +(-?\d+)?/i)){
		this.log.debug(match);
		statName = match[1];
		var value = parseInt(match[3]) || 1;

		if(match[2] == "remove"){
			value *= -1;
		}
		cmdFunk = this.modifyStat.bind(this, user, value);
	}
	else{
		cmdFunk = this.triggerStat.bind(this, user);
		statName = command;
	}

	if(cmdFunk instanceof Function && statName){
		Models.Statistic
			.find({where: {command: statName, ChannelId: this.channel.model.id}})
			.success(cmdFunk);
	}
};

c.getCount = function(statistic, game){
	return Models.Count.findOrCreate({StatisticId: statistic.id, game: game});
}

c.modifyStat = function(user, value, statistic){
	if(!statistic){
		return;
	}
	var game;
	if((game = this.checkGame()) && this.checkModLoud(user)){
		this.getCount(statistic, game)
			.then(this.doModifyStat.bind(this, statistic, game, value));
	}
}

c.doModifyStat = function(statistic, game, value, count){
	count.value += value;
	count.save();

	this.sayStatValue(statistic, game, count);
}

c.setStat = function(user, value, statistic){
	if(!statistic){
		return;
	}
	var game;
	if((game = this.checkGame()) && this.checkModLoud(user)){
		this.getCount(statistic, game)
			.then(this.doSetStat.bind(this, statistic, game, value));
	}
}

c.doSetStat = function(statistic, game, value, count){
	count.value = value;
	count.save();

	this.sayStatValue(statistic, game, count);
}

c.triggerStat = function(user, statistic){
	if(!statistic){
		return;
	}
	var game;
	if((game = this.checkGame()) && this.checkTimeLoud(statistic.name + "Trigger", 5, user)){
		this.getCount(statistic, game)
			.then(this.increaseStat.bind(this, statistic, game));
	}
}

c.increaseStat = function(statistic, game, count){
	count.value += 1;
	count.save();

	this.sayStatValue(statistic, game, count);
}

c.parrotStat = function(user, statistic){
	if(!statistic || !this.checkTime(statistic.name + "Parrot", 15)){
		return;
	}
	var game;
	if(game = this.checkGame()){
		this.getCount(statistic, game)
			.then(this.sayStatValue.bind(this, statistic, game));
	}
}

c.sayStatValue = function(statistic, game, count){
	var msg = "%value% %name% for %game%";

	if(count.value == 1){
		msg = msg.replace("%name%", statistic.name);
	}
	else{
		msg = msg.replace("%name%", statistic.plural);
	}

	msg = msg.replace("%value%", count.value);
	msg = msg.replace("%game%", game);

	this.channel.say(msg);
}
