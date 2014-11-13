var https = require('https');
var url = require("url");
var query = require("querystring");
require('es6-promise').polyfill();

function request(href, method, extras, context){
	var self = context;

	var promise = new Promise(function(resolve, reject){

		var options = {
			host: url.parse(href).host,
			port: 80,
			path: url.parse(href).path,
			method: method || 'GET'
		}

		var data = options.method == "POST" ? query.stringify({
			client_id : self.config.clientID,
			client_secrect: self.config.secret,
			grant_type: "authorization_code",
			redirect_uri: self.config.responseURL,
			code: extras.code
		}) : "";

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
		})

		req.on("error", function(error){
			reject(error);
		})

		if( options.method == "POST" ){
			req.write(data);
		}

		req.end();
	})

	return promise;
}

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
		token : 'https://api.instagram.com/oauth/access_token/',
		popular : 'https://api.instagram.com/v1/media/popular',
		user : 'https://api.instagram.com/v1/users/{{id}}',
		userFeed : 'https://api.instagram.com/v1/users/self/feed',
		userLikes : 'https://api.instagram.com/v1/users/self/media/liked',
		userRecentMedia : 'https://api.instagram.com/v1/users/{{id}}/media/recent',
		media : 'https://api.instagram.com/v1/media/{{id}}',
		likes : 'https://api.instagram.com/v1/media/{{id}}/likes',
		comments : 'https://api.instagram.com/v1/media/{{id}}/comments',
		requests : 'https://api.instagram.com/v1/users/self/requested-by',
		follows : 'https://api.instagram.com/v1/users/{{id}}/follows',
		followers : 'https://api.instagram.com/v1/users/{{id}}/followed-by',
		relationship : 'https://api.instagram.com/v1/users/{{id}}/relationship',
		searchMedia : 'https://api.instagram.com/v1/media/search',
		searchTag : 'https://api.instagram.com/v1/tags/search',
		tags : 'https://api.instagram.com/v1/tags/{{tag}}',
		recentTags : 'https://api.instagram.com/v1/tags/{{tag}}/media/recent',
		searchLocation : 'https://api.instagram.com/v1/locations/search',
		locations : 'https://api.instagram.com/v1/locations/{{id}}',
		recentLocations : 'https://api.instagram.com/v1/locations/{{id}}/media/recent',
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
	request(this.apis("token"), "POST", {code: code}, self)
		.then(function(result){
			console.log("Hi")
		}, function(error){
			console.log(error)
		});
}

module.exports = new Instagram();