var https = require('https');
var url = require("url");
var query = require("querystring");
var _ = require('underscore');
require('es6-promise').polyfill();

/*

HELPER METHODS

*/

function request(href, method, body, context){
	var self = context;
	var promise = new Promise(function(resolve, reject){

		var options = {
			host: url.parse(href).host,
			path: url.parse(href).path,
			method: method || 'GET',
			headers: {
				'Content-type': 'application/json',
				'Content-length': body.length
			}
		}

		var req = https.request(options, function(res){
			var chunks = '';

			res.setEncoding('utf8');
			res.on('data', function(chunk){
				chunks += chunk.toString();
			})

			res.on('end', function(){
				if(chunks){
					resolve(chunks);
				}
			})
		});


		req.on("error", function(error){
			reject(error);
		})

		if( body ){
			req.write(body);
		}

		req.end();
	})

	return promise;
}

function get(options){
	request(options.endpoint, "GET", options.data, options.context)
		.then(function(result){
			options.success()
		}, function(error){
			options.error();
		})
}

function post(options){
	request(options.endpoint, "POST", options.data, options.context)
		.then(function(result){
			options.success()
		}, function(error){
			options.error();
		})
}

function defaultSuccess(){
	console.log("Success");
}

function defaultError(){
	console.log("Error");
}

/*
	
	PRIVATE FUNCTIONS

*/

function getWithID(options, success, error){
	var _options = _.extend({
		endpoint: self.apis("user"),
		success: defaultSuccess,
		error: defaultError
	}, options);

	if(!options.id){
		throw Error("id is necessary in options");
	}

	get(_options);
}

function getWithTag(options, success, error){
	var _options = _.extend({
		endpoint: self.apis("user"),
		success: defaultSuccess,
		error: defaultError
	}, options);

	if(!options.tag){
		throw Error("tag is necessary in options");
	}

	get(_options);
}

function postWithID(options, success, error){
	var _options = _.extend({
		endpoint: self.apis("user"),
		success: defaultSuccess,
		error: defaultError
	}, options);

	if(!options.id){
		throw Error("id is necessary in options");
	}

	post(_options);
}

function postWithTag(options, success, error){
	var _options = _.extend({
		endpoint: self.apis("user"),
		success: defaultSuccess,
		error: defaultError
	}, options);

	if(!options.tag){
		throw Error("tag is necessary in options");
	}

	post(_options);
}

/*
	INSTAGRAM API

*/

function Instagram(){
	this.config = {
		clientID: "",
		secret: "",
		accessToken: "",
		responseURL: ""
	};

	return this;
}

Instagram.prototype.apis = function(endpoint, options) {

	if(!endpoint){
		return;
	}

	var self = this;

	var urls = {
		authorize : 'https://instagram.com/oauth/authorize/?client_id=' + self.config.clientID + '&redirect_uri=' + self.config.responseURL + '&response_type=code',
		token : 'https://api.instagram.com/oauth/access_token',
		popular : 'https://api.instagram.com/v1/media/popular',
		user : 'https://api.instagram.com/v1/users/' + options.id || options,
		userFeed : 'https://api.instagram.com/v1/users/self/feed',
		userLikes : 'https://api.instagram.com/v1/users/self/media/liked',
		userRecentMedia : 'https://api.instagram.com/v1/users/' + options.id || options + '/media/recent',
		media : 'https://api.instagram.com/v1/media/' + options.id || options,
		likes : 'https://api.instagram.com/v1/media/' + options.id || options + '/likes',
		comments : 'https://api.instagram.com/v1/media/' + options.id || options + '/comments',
		requests : 'https://api.instagram.com/v1/users/self/requested-by',
		follows : 'https://api.instagram.com/v1/users/' + options.id || options + '/follows',
		followers : 'https://api.instagram.com/v1/users/' + options.id || options + '/followed-by',
		relationship : 'https://api.instagram.com/v1/users/' + options.id || options + '/relationship',
		searchMedia : 'https://api.instagram.com/v1/media/search',
		searchTag : 'https://api.instagram.com/v1/tags/search',
		tags : 'https://api.instagram.com/v1/tags/' + options.tag || options,
		recentTags : 'https://api.instagram.com/v1/tags/' + options.tag || options + '/media/recent',
		searchLocation : 'https://api.instagram.com/v1/locations/search',
		locations : 'https://api.instagram.com/v1/locations/' + options.id || options,
		recentLocations : 'https://api.instagram.com/v1/locations/' + options.id || options + '/media/recent',
		searchUser : 'https://api.instagram.com/v1/users/search'
	};

	return urls[endpoint];
};

Instagram.prototype.authorize = function(scopes) {
	var scope = ( scopes ) ? "&scope=" + scopes.join("+") : "";
	var href = this.apis('authorize');

	return href;
};

Instagram.prototype.getToken = function(code){
	var self = this;

	var data = query.stringify({
		client_id : self.config.clientID,
		client_secret: self.config.secret,
		grant_type: "authorization_code",
		redirect_uri: self.config.responseURL,
		code: code
	});

	request(this.apis("token"), "POST", data, self)
		.then(function(result){
			self.config.accessToken = JSON.parse(result).accessToken
		}, function(error){
			throw Error("Something went wrong retrieving access_token");
		});
}

/*
	Options:
	
	Required
	id: ID of the Media being liked/disliked

	Optional
	action: Default is 'list' which returns all likes for selected media. Other possible values are 'set' and 'delete' which like and dislike selected media respectively.

*/
Instagram.prototype.like = function(options) {
	var self = this;
	var _options = _extend({
			action: 'list'
		}, options);
	var _data = _extend({
			access_token: self.config.accessToken
		}, options.data);

	_options.data = _data;

	// switch(_options.action){
	// 	case 'list':
			
	// }

};

module.exports = new Instagram();
