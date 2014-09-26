
/*
	This singlettoni (singleton written in sphagetti code) establishes the connection to the irc server and allows
	channels to register themselves to receive events.
*/

"use strict";

var irc = require('irc');
var log = require('./log.js');

var channel = require('./lib/channel.js');

//We setup the options object and import the oauth token.
var token = require('./secrets.js').twitchToken;
var options = {
	'userName': "leg_bot",
	'realName': "leg_bot",
	'password': token,
};

var client = module.exports.client = new irc.Client("irc.twitch.tv", "leg_bot", options);

//We store Channel objects that we pass messages to
var channels = {};

//This will get thrown a bunch of channel models that we should enter
//and then start throwing messages at.
module.exports.joinChannels = function(channels){
	channels.forEach(joinChannel);
}

var joinChannel = module.exports.joinChannel = function(channel){
	if(channels[channel.hashtag]){
		return;
	}
	log.info('joining', channel.hashtag);

	channels[channel.hashtag] = channel;
	client.join(channel.hashtag);
}

client.on('disconnected', function(){
	log.info("DISCONNECTED", arguments);
});

//We add a bunch of listeners to the IRC client that forward the events ot the appropriate Channel objects.
client.on('message', function(user, channel, message){
	var channel = channels[channel];

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
		channel.onUserModded(user);
	}
	else if(args[1] == '-o'){
		channel.onUserUnmodded(user);
	}
}

client.on('+mode', parseMode);
client.on('-mode', parseMode);
