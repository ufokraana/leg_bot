"use strict";

var twitch = require('../../lib/twitch.js');


module.exports = function(app){

	app.get('/live', function(req, res){
		res.send(JSON.stringify(twitch.getData()));
	});
};
