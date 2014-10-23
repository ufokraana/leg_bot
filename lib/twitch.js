"use strict";

var https = require('https');
var config = require("../config.js").twitchAPI;

var log = require("../log.js");

var twitchStreams = config.otherChannels;
var twitchData = {};
var channels = {};

module.exports.addChannel = function(channel){
	var name = channel.model.name];
	channels[name] = channel;
	if(twitchStreams.indexOf(name) != -1){
		twitchStreams.push(channel.model.name);
	}
}


var queryTwitch = function(){
	var me = this;	

	var channelList = twitchStreams.join();


	//We setup the request options
	var options = {
		hostname: config.hostname,
		path: config.path.replace('%channels%', channelList),

		method: "GET",
	};

	var json = "";

	//This is pretty standard nodejs http request code.
	var req = https.request(options, function(res){
		res.on('data', function(chunk){
			json += chunk;
		});

		res.on('end', function(){
			parseTwitchJSON(json);
		});
	});
	req.end();
};

var parseTwitchJSON = function(json){
	try{
		json = JSON.parse(json);
	}
	catch(e){
		log.error("Got unusable response from twitch API.");
		return;
	}

	if(json.streams instanceof Array){
		json = json.streams;
	}
	else{
		log.error("Got twitch API data with no stream array");
		return;
	}

	twitchData = {};

	json.forEach(function(stream){
		twitchData[stream.channel.name] = stream;
	});
	
	distributeTwitchData();
}

var distributeTwitchData = function(){
	Object.keys(channels).forEach(function(c){
		channels[c].updateTwitchData(twitchData[c]);
	});
}

var interval = setInterval(queryTwitch, config.interval);
setTimeout(queryTwitch, 10 * 1000);
