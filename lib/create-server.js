var express 				  = require('express'),
		bodyParser 			  = require('body-parser'),
		ejs 						  = require('ejs'),
		methodOverride  	= require('method-override'),
    session           = require('express-session'),
   	expressEjsLayouts = require('express-ejs-layouts'),
		mongoose 				  = require('mongoose');

module.exports = function () {
  var server = express();

  server.set('views', './views');
  server.set('view engine', 'ejs');

  server.use(session({
    secret: "SuperSecretySecretsThatAreSecret",
    resave: false,
    saveUninitialized: true
  }));

  server.use(express.static('./public'));
  server.use(bodyParser.urlencoded({ extended: true }));
  server.use(methodOverride('_method'));
  server.use(expressEjsLayouts);

  return server;
};