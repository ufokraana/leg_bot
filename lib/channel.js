"use strict";

var log = require('../log.js');

var modules = require('./modules');

//We store methods here and pass them to the model.
var c = {};

//This attaches the channel model to the irc client
c.joinIRC = function(){
	this.bindEvents();
};

c.bindEvents = function(){
	if(this.eventsBound){
		return;
	}

	this.on('userModded', this.onUserModded.bind(this));
	this.on('userUnmodded', this.onUserUnmodded.bind(this));

	this.eventsBound = true;
}

//These get called when twitch tells us of somebody being modded or unmodded
//Because twitch is derpy we implement a timeout to removing mod status.
c.onUserModded = function(user){
	this.mods[user] = true;
	this.log.log("U:", user, "is now a mod");
	clearTimeout(this.modTimeouts[user]);
}
c.onUserUnmodded = function(user){
	var me = this;
	this.modTimeouts[user] = setTimeout(function(){
		me.log.log(user, "is not a mod anymore");
		me.mods[user] = false;
	});
}

//This gets called with every message sent to the channel
c.onMessage = function(message){

}

//This is what command modules call to say stuff in the channel.
c.say = function(message){
	this.log.log("Saying:", message);
	client.client.say(this.hashtag, message);
}


var sequelize = require('./sequelize.js');
var Sequelize = require('sequelize');

var Channel = module.exports = sequelize.define('Channel', {
	name: Sequelize.STRING(25),
	active: Sequelize.BOOLEAN
}, {
	timestamps: false,
	instanceMethods: c,
});

