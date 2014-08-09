
var I = {};

I.setSetting = function(name, value){
	this.log("Setting", name, "is now", value);
	this.settings[name] = value;
}

I.setDefaultSettings = function(){
	var defaults = this.defaultSettings || {};

	var me = this;

	this.log("Setting default settings");

	Object.keys(defaults).forEach(function(name){
		me.setSettings(name, defaults[name]);
	})
}


module.exports.inject = function(proto){
	Object.keys(I).forEach(function(method){
		proto[method] = I[method];
	});
}
