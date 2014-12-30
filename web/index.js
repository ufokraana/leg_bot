"use strict";

var express = require("express");

var config = require("../config.js").web;

var app = express();

var jade = require('jade');
app.engine('jade', jade.__express);
app.set('views', './web/views');

var compression = require('compression');
app.use(compression());

app.use('/api', require('./api'));

var serveStatic = require('serve-static');
app.use('/static', serveStatic('./web/static'));

app.use('/', require('./page'));

var server = app.listen(config.port);
