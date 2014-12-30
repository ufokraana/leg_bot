"use strict";

module.exports = function(app){

	app.get('/live$', function(req,res){
		res.render('live.jade');
	});
};
