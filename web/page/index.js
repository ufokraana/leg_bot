"use strict";

var express = require('express');

var mw = module.exports = new express.Router({mergeParams: true});

mw.get('^/$', function(req, res){
	res.render('index.jade');
});

//require('./stats.js')(mw);
require('./live.js')(mw);
