"use strict";

//We initialize Sequelize.js here and define the models that leg_bot uses.

var Sequelize = require('sequelize');
var config = require('../config.js').db;

var options = {
	dialect: 'sqlite',
	storage: config.file,
	logging: false,
};

var sequelize = module.exports.sequelize = new Sequelize('','','',options);

sequelize.authenticate();

//These are default options that all models get.
//Right now, we just disable the timestamping that sequelize does.
var options = {
	timestamps: false
}

//This is the type rule for every place we store a command
var commandType = {
	type: Sequelize.STRING(32),
	allowNull: false,
	validate: {
		isAlpha: true
	}
}

//Channels are the twitch/IRC channels we join
var Channel = module.exports.Channel = sequelize.define('Channel', {
	name: Sequelize.STRING(25),
	active: Sequelize.BOOLEAN
}, {
	timestamps: false,
});

//Modules are different sets of commands that channels can have.
var Module = module.exports.Module = sequelize.define('Module', {
	name: Sequelize.STRING(32),
	active: Sequelize.BOOLEAN
}, options);

Module.hasMany(Channel);
Channel.hasMany(Module);

//Replies are simple call and response answers
var Reply = module.exports.Reply = sequelize.define('Reply', {
	command: commandType,
	reply: Sequelize.STRING(255),
}, options);

Channel.hasMany(Reply);


//Statistics are things the bot will count for a channel.
//Think !death !flunge or !warcrime
var Statistic = module.exports.Statistic = sequelize.define('Statistic', {
	command: commandType, 
	name: Sequelize.STRING(64),
	plural: Sequelize.STRING(64),	
}, options);

Channel.hasMany(Statistic);

//Counts are actual instances of a channel counting a thing.
var Count = module.exports.Count = sequelize.define('Count', {
	game: Sequelize.STRING(255),
	value: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
		validate: {
			isInt: true,
		},
	},
}, options);

Statistic.hasMany(Count);
