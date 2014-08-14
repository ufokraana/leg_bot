"use strict";

var log = require('./log.js');

log.log("Starting legbot");

var client = require('./client.js');
var db = require('./db.js');

var Channel = require('./lib/channel.js');

//This is a dictionary of channel objects.
var channels = {};

client.client.on('connect', function(){
	log.log("Connected!");
	loadChannels();
});

function loadChannels(){
	var query = "SELECT name FROM channel WHERE active";
	db.db.each(query,
		function(err, row){
			channels[row.name] = new Channel(row.name);
		}
	);
}

//We do a clean disconnect on SIGINT before dying
process.on('SIGINT', function(){
	log.log("Got SIGINT! Disconnecting IRC and exiting.");

	client.client.disconnect("Time for off line LEG DAY!", function(){
		log.log("Disconnected.");
	});

	//Instead of using the callback we set a 2 second timeout.
	//Checking wether the IRC connection is active is a bit of a bother and can give a false answer.
	setTimeout(function(){
		process.exit();
	}, 2000);
});


