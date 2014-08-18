
/*
	This singlettoni (singleton written in sphagetti code) establishes the connection to the irc server and allows
	channels to register themselves to receive events.
*/

"use strict";

var irc = require('irc');
var log = require('./log.js');

//We setup the options object and import the oauth token.
var token = require('./key.js');
var options = {
	'userName': "leg_bot",
	'realName': "leg_bot",
	'password': token,
};

var client = module.exports.client = new irc.Client("irc.twitch.tv", "leg_bot", options);

//We store Channel objects that we pass messages to
var channels = {};

//This adds a new Channel object and also joins that channel on the IRC client.
module.exports.registerChannel = function(channel, listener){
	log.log("Entering channel", channel);
	client.join(channel);
	channels[channel] = listener;
}

//We add a bunch of listeners to the IRC client that forward the events ot the appropriate Channel objects.
client.on('message', function(user, channel, message){
	channel = channels[channel];
	channel && channel.onMessage(user, message);
});

//We use this to parse op status updates
function parseMode(channel, by, mode, argument, message){
	//What we need is an obscure part in the message object :(
	var args = message.args;

	//we do not care about anything other than O (giggity)
	if(mode != 'o'){
		return;
	}
	var user = args[2];
	var channel = channels[args[0]];

	if(!channel){
		return;
	}

	if(args[1] == '+o'){
		channel.onModded(user);
	}
	else if(args[1] == '-o'){
		channel.onUnmodded(user);
	}
}

client.on('+mode', parseMode);
client.on('-mode', parseMode);
