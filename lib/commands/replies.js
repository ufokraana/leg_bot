"use strict";

var Models = require('../models.js');

var Replies = module.exports = function(channel){

	this.channel = channel;

	this.loadModels();
}

var r = Replies.prototype;

r.loadModels = function(){
	channel.getReplies.success(this.parseModels.bind(this));
}


