"use strict";

var express = require('express');

var mw = module.exports = new express.Router({mergeParams: true});

require('./live.js')(mw);

mw.use('/channel', require('./channel.js'));

mw.get('/', function(req, res){
	res.send("Only scrubs skip API params.");
});
