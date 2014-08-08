"use strict";

var log = require('./log.js');

log.log("Starting legbot");

var client = require('./client.js');
var Channel = require('./Lib/Channel.js');

//This is a dictionary of channel objects.
var channels = {};

var tc;

client.client.on('connect', function(){
	log.log("Connected!");
	tc = new Channel("#every_day_is_leg_day");
});
