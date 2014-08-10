
var CM = require('../commandmodule.js');

var BotModule = module.exports = function(channel){
	CM.call(this, "Bot", channel);

	this.bindCommands();
}

CM.adopt(BotModule);

var b = BotModule.prototype;

b.commands = {};

b.commands['^!(leg_?)?bot'] = function(match, user, message){
	this.channel.say("Hi, " + user + "!");
}
