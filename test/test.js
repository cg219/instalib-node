var express = require("express");
var instagram = require("./../index.js")
var app = express();

instagram.config = {
	clientID: "9fd749315c5546cf99e389fcc7ec2bb9",
	responseURL: "http://localhost:3000/cb",
	secret: "a9ef1694afda48e38e13bd32bc3234d2"
}

app.set("view engine", "jade");

app
	.get("/", function(req, res){
		res.render("index",{
			authURL: instagram.authorize()
		});
	})
	.get("/cb", function(req, res){
		instagram.getToken(req.query.code).then(function(result){
			res.send(JSON.parse(result));
		}, function(error){
			res.send(error);
		});

	})
	.listen(3000);
