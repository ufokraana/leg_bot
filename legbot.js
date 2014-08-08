
var client = require('./client.js');

var Channel = require('./Lib/Channel.js');

var channels = {};

client.client.on('connect', function(){
	console.log("Connection!");
	tc = new Channel("#every_day_is_leg_day");
});
