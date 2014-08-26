"use strict";

//We initialize Sequelize.js here and define the models that leg_bot uses.

var Sequelize = require('sequelize');
var config = require('../config.js').db;

var options = {
	dialect: 'sqlite',
	storage: config.file
};

var sequelize = module.exports.sequelize = new Sequelize('','','',options);

sequelize.authenticate();

var channelMethods = require('./channel_methods.js');

var options = {
	timestamps: false
}

//Channels are the twitch/IRC channels we join
var Channel = module.exports.Channel = sequelize.define('Channel', {
	name: Sequelize.STRING(25),
	active: Sequelize.BOOLEAN
}, {
	timestamps: false,
	instanceMethods: channelMethods,
});

//Modules are different sets of commands that channels can have.
var Module = module.exports.Module = sequelize.define('Module', {
	name: Sequelize.STRING(25),
	active: Sequelize.BOOLEAN
}, options);

Module.hasMany(Channel);
Channel.hasMany(Module);

//Replies are simple call and response answers
var Reply = module.exports.Reply = sequelize.define('Reply', {
	command: Sequelize.STRING(32),
	reply: Sequelize.STRING(255),
}, options);

Channel.hasMany(Reply);

//Statistics are things the bot will count for a channel.
//Think !death !flunge or !warcrime
var Statistic = module.exports.Statistic = sequelize.define('Statistic', {
	
}, options);

Channel.hasMany(Statistic);

//Counts are actual instances of a channel counting a thing.
