const request 		= require('request');
const keys 			= require('../keys');
const Stream         = require('../models/stream');


let baseRequest = request.defaults({
	headers: keys.twitch,
	baseUrl: 'https://api.twitch.tv/'
})

module.exports = function(router) {

}