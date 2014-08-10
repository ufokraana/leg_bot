//Injectable settings loader for modules and channels.

var db = require('../db.js');

var I = {};

//Sets a single settings
I.setSetting = function(name, value){
	this.log.log("Setting", name, "is now", value);
	this.settings[name] = value;
}

//Iterates over the default settings object and calls setSetting for every one.
I.setDefaultSettings = function(){
	var defaults = this.defaultSettings || {};

	var me = this;

	this.log.log("Setting default settings");

	Object.keys(defaults).forEach(function(name){
		me.setSetting(name, defaults[name]);
	})
}

//Queries the DB for settings and calls setSetting for every entry.
//Calls onSettingsLoaded afterwards
I.querySettings = function(){
	this.log.log("Querying settings from the DB");

	var query = "SELECT name, value FROM " + this.settingsTable + " WHERE " + this.settingsWhere;

	this.log.debug("Using query:", query, "with binding:", this.settingsWhereBindings);

	var me = this;

	var onLoaded = this.onSettingsLoaded.bind(this) || function(){};

	this.log.debug(onLoaded);

	db.each(
		query,
		this.settingsWhereBindings,
		function(err, row){
			me.log.debug("Got row:", row);
			if(!err){
				me.setSetting(row.name, row.value);
			}
			else{
				me.log.error("Got SQL error:", err);
			}
		},
		onLoaded
	);
}

//Sets default settings, then queries the DB for overrides.
I.initSettings = function(){
	this.setDefaultSettings();
	this.querySettings();
}

module.exports.inject = function(proto){
	Object.keys(I).forEach(function(method){
		proto[method] = I[method];
	});
}
