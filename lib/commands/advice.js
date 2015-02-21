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
	var advice = this.lastAdvice = advices[index];
	advice = advice.content;

	if(Math.random() < 0.05){
		advice += " #snorp";
	}

	this.channel.say(advice);
}

c.commands = {
	'advice': {
		time: 30,
		regex: /^advice$/i,
		method: function(match, user, message){
			this.pickAndSayRandom();
		}
	},

	'sir': {
		time: 30,
		regex: /^sir$/i,
		method: function(match, user, message){
			if(advices.length == 0){
				return;
			}
			var index = Math.floor(Math.random() * advices.length);
			var advice = this.lastAdvice =  advices[index];
			this.channel.say("Sir? Sir! " + advice.content);

		}
	},

	'tradition': {
		time: 30,
		regex: /^tradition$/i,
		method: function(match, user, message){
			//original idea by Compleatly in LRL chat.
			if(advices.length == 0){
				return;
			}
			var index = Math.floor(Math.random() * advices.length);
			var advice = this.lastAdvice =  advices[index];
			this.channel.say(advice.content + " as is tradition!");

		}
	},

	'advice count':{
		time: 30,
		regex: /^advice ?count$/i,
		method: function(match, user, message){
			var msg = "There are %count% pieces of \"useful\" advice available";
			msg = msg.replace("%count%", advices.length);

			this.channel.say(msg);
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
					var message = "Written by: " + advice.author;
					message += " on channel: " + channel.values.name;
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
				me.channel.say("Advice added. Bad advice will be deleted.");
			});
		}
	},
}
