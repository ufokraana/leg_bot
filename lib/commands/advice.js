"use strict";

var SimpleCommands = require('./simple_commands.js');

var models = require('../models.js');
var Advice = models.Advice;

var AdviceModule = module.exports = function(channel){
	SimpleCommands.call(this, channel);

	this.lastAdvice = undefined;
};

var advices = [];

var loadTimeout;

var loadAdvices = function(){
	if(loadTimeout){
		clearTimeout(loadTimeout);
		loadTimeout = undefined;
	}
	Advice.findAll().then(function(adv){
		advices = adv;
	});

	loadTimeout = setTimeout(loadAdvices, 4 * 60 * 1000);
}

loadAdvices();

SimpleCommands.adopt(AdviceModule);

var c = AdviceModule.prototype;

c.pickAndSayRandom = function(){
	if(advices.length == 0){
		return;
	}
	var index = Math.floor(Math.random() * advices.length);
	var advice = this.lastAdvice =  advices[index];
	this.channel.say(advice.content);
}

c.commands = {
	'advice': {
		time: 30,
		regex: /^advice$/i,
		method: function(match, user, message){
			this.pickAndSayRandom();
		}
	},

	'advice source': {
		time: 30,
		regex: /^advice +source$/i,
		method: function(match, user, message){
			if(!this.lastAdvice){
				return;
			}

			var me = this;
			var advice = this.lastAdvice;
			models.Channel
				.find(advice.ChannelId)
				.success(function(channel){
					var message = "Added by moderator: " + advice.author;
					message += " on channel: " + channel.name;
					message += " during game: " + advice.game;
					me.channel.say(message);
				});
		}
	},

	'advice add': {
		time: 60,
		timeLoud: true,
		regex: /^advice add +(\w.*)$/i,
		gameNeeded: true,
		modOnly: true,
		method: function(match, user, message){
			var game = this.checkGame();

			if(!game){
				return;
			}

			var me = this;
			var adviceText = match[1];
			Advice.create({
				game: game,
				author: user,
				content: adviceText,
				ChannelId: this.channel.model.id
			}).success(function(){
				me.channel.say("Advice added.");
			});
		}
	},
}
