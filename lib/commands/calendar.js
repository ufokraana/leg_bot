"use strict";

var SimpleCommands = require('./simple_commands.js');

var config = require('../../config.js').gCal;

var log = require('../../log.js');

var calendar = require('../google_calendar.js');
var CalendarModule = module.exports = function(channel){
	SimpleCommands.apply(this, arguments);
};

var Moment = require('moment-timezone');

var timezones = Moment.tz.names();

SimpleCommands.adopt(CalendarModule);

var c = CalendarModule.prototype;

c.reportEvents = function(calName, tz){
	var events = calendar.getNextEvents(calName);

	if(!tz){
		tz = config.timeZone;
	}
	else if(!(~timezones.indexOf(tz))){
		this.channel.say("Unknown timezone: " + tz);
		return;
	}

	log.debug(tz);

	if(!events){
		this.channel.say("No calendar data loaded. Yet.");
		return;
	}

	var list = [];

	events.forEach(function(ev){
		var desc = ev.summary;
		var start = ev.start.clone();

		start.tz(tz);

		desc += " at " + start.format(config.displayFormat, tz);
		desc += " (" + start.fromNow() + ")";

		list.push(desc);
	});

	this.channel.say('Currently live & upcoming streams: ' + list.join(', '));
};


c.commands = {
	'nextlrr': {
		time: 15,
		regex: /^nextlrr *(.*)?/i,
		method: function(match, user, message){
			var tz = match[1];
			this.reportEvents('lrr', tz);
		}
	},
	'nextfan': {
		time: 15,
		regex: /^nextfan *(.*)?/i,
		method: function(match, user, message){
			var tz = match[1];	
			this.reportEvents('fan', tz);
		}
	},
}
