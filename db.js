var sqlite3 = require('sqlite3');
var Q = require('q');

var db = module.exports.db = new sqlite3.Database('./legbot.sqlite');

module.exports.get = Q.nbind(db.get, db);
module.exports.run = Q.nbind(db.run, db);
module.exports.all = Q.nbind(db.all, db);
