//Injectable settings loader for modules and channels.

"use strict";

var db = require('../db.js');

var I = {};

//Sets a single settings
I.setSetting = function(name, value){
	var definition = this.settingsDefinition[name];

	//We check if this setting exists in the first place
	if(!definition){
		this.log.error("Ignoring setting", name, "it does not exist");
		return;
	}

	//If the setting has a check for a valid value, we run that check.
	if(definition.check instanceof Function && !definition.check(value)){
		this.log.error("Setting", name, "has an incorrect value", value);
		return;
	}

	//If the setting has a parser to build a more javascripty thing out of the sqlite entry
	//we run that.
	if(definition.parse instanceof Function){
		value = definition.parse(value);
	}

	//Finally, we set the setting
	this.log.log("Setting", name, "=", value);
	this.settings[name] = value;
}

//Iterates over the default settings object and calls setSetting for every one.
I.setDefaultSettings = function(){
	var definition = this.settingsDefinition;

	var names = Object.keys(definition);

	names.forEach(function(name){
		this.setSetting(name, definition[name].defaultValue);
	}, this);
}

//Queries the DB for settings and calls setSetting for every entry.
//Calls onSettingsLoaded afterwards
I.querySettings = function(){
	this.log.debug("Querying settings from the DB");
	var query = "SELECT name, value FROM " + this.settingsTable + " WHERE " + this.settingsWhere;
	this.log.debug("Using query:", query, "with binding:", this.settingsWhereBindings);


	var parse = function(rows){
		rows.forEach(function(row){
			this.setSetting(row.name, row.value);
		}, this);
		
		if(this.onSettingsLoaded instanceof Function){
			this.onSettingsLoaded();
		}
	}

	var promise = db.all(query, this.settingsWhereBinding);
	promise.then(parse.bind(this));
	promise.fail(this.log.error);
}

I.initSettings = function(){
	this.setDefaultSettings();
	this.querySettings();
}

module.exports.inject = function(proto){
	Object.keys(I).forEach(function(method){
		proto[method] = I[method];
	});
}
