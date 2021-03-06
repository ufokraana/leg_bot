"use strict";

var log = require('./log.js');

log.info("Starting legbot");

var client = require('./client.js');

var Channel = require('./lib/channel.js');

var Web = require('./web');

client.client.on('connect', function(){
	log.info("Connected!");
	loadChannels();
});

function loadChannels(){
	log.debug("Querying channels to join");
	Channel.findActiveChannels(client.joinChannels);
}

//We do a clean disconnect on SIGINT before dying
process.on('SIGINT', function(){
	log.info("Got SIGINT! Disconnecting IRC and exiting.");

	client.client.disconnect("Time for off line LEG DAY!", function(){
		log.info("Disconnected.");
	});

	//Instead of using the callback we set a 2 second timeout.
	//Checking wether the IRC connection is active is a bit of a bother and can give a false answer.
	setTimeout(function(){
		process.exit();
	}, 2000);
});

