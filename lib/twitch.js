//Channel objects use this code to query the twitch API for game/viewers/etc information.

var lastQuery =  0;

var https = require('https');
var config = require("../config.js").twitchAPI;

var I = {};

//This queries twitch's API for channel info.
//It needs to be bound to a channel object to work.
I.queryTwitch = function(){
	var me = this;	

	//We setup the request options
	var options = {
		hostname: config.hostname,
		path: config.path.replace('%channel%', this.model.name),

		method: "GET",
	};

	this.log.info("Querying twitch API for channel data");
	var json = "";

	//This is pretty standard nodejs http request code.
	var req = https.request(options, function(res){
		res.on('data', function(chunk){
			json += chunk;
		});

		res.on('end', function(){
			me.parseTwitchJSON(json);
		});
	});
	req.end();
};

I.setTwitchInterval = function(){
	this.twitchInterval = setInterval(
		this.queryTwitch.bind(this),
		5 * 60 * 1000
	)
}

//This parses the twitch result and fills out the twitch object on the channel.
I.parseTwitchJSON = function(json){
	var t = this.twitchData = {
		live: false,
	};
	
	var json;
	try{
		json = JSON.parse(json);
	}
	catch(e){
		this.log.error("Got unusable response from twitch API.");
		return;
	}

	if(json && json.stream){
		var stream = json.stream;
		t.live = true;

		t.game = stream.game;
		t.viewers = stream.viewers;

		this.log.info("parsed JSON data from twitch API");
	}
	else if(!json){

	}
}

module.exports.inject = function(proto){
	Object.keys(I).forEach(function(key){proto[key] = I[key]});
}
