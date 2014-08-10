
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

//We store Channel objects that we use to emit channel events.
var channelEventListeners = {};

//This adds a new Channel object and also joins that channel on the IRC client.
module.exports.registerChannel = function(channel, listener){
	log.log("Entering channel", channel);
	client.join(channel);
	channelEventListeners[channel] = listener;
}

//Helper function for calling emit on the right channel.
function channelEvent(channel, name, data){
	channel = channelEventListeners[channel];
	channel && channel.emit && channel.emit(name, data);
}

//We add a bunch of listeners to the IRC client that forward the events ot the appropriate Channel objects.
client.on('message', function(user, channel, message){
	log.debug("C:", channel, "U:", user, "M:", message);
	channelEvent(channel, "message", {user: user, message: message});
});


