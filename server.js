
const config 		= require('./config');
const keys 			= require('./keys');
const express		= require('express');
const exphbs		= require('express-handlebars');
const app			= express();
const bodyParser	= require('body-parser');
const request 		= require('request');
//var sql 		= require('sql');

let Game 			= require('./models/game');
let Streamer 		= require('./models/streamer');

let baseRequest = request.defaults({
	headers: keys.twitch,
	baseUrl: 'https://api.twitch.tv/'
})

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

var router = express.Router();

router.use(function(req, res, next) {
	next();
})

router.get('/', function(req, res) {
	querySpecificGames(res);		//TODO: Async calls
})

app.use('/', router);


app.listen(3000);

var games = new Map();
var streamers = new Map();

// Gets the most popular streamers (of any game)
function queryTopStreams(res) {
	baseRequest.get({
		uri: 'kraken/games/top'
	}, function(error, response, body) {
		res.send(body);  
	})
}

// Gets the most popular streamers for a specific game
function queryGameStreamers(res) {
	baseRequest.get({
		uri: 'helix/streams',
		qs: {
			game_id: Array.from(games.keys()),
			language: 'en',
			first: 100
		}
	}, function(error, response, body) {
		buildStreamerList(JSON.parse(response.body).data);

		queryStreamerDetails(res);
	})
}

// Gets details on specified streamers
function queryStreamerDetails(res) {
	baseRequest.get({	
		uri: 'helix/users',
		qs: {
			id: Array.from(streamers.keys())
		}
	}, function(error, response, body) {

		let data = JSON.parse(response.body).data;
		
		data.forEach(function(streamer) {
			let streamerObject = streamers.get(streamer.id);
			streamerObject.setName(streamer.login);

			streamers.set(streamer.id, streamerObject);
		})

		doMagic(res);

	})
}

function doMagic(res) {

	console.log(streamers);
	res.render('home', {
		helpers: {
			eachInMap: function (map, block) {
				let output = '';
  
				for (const [ key, value ] of map) {
				  output += block.fn({ key, value });
				}
			  
				return output;
			}
		},
		games: games,
		streamers: streamers
	});
}

// Gets the most popular games
function queryTopGames(res) {
	baseRequest.get({
		uri: 'kraken/games/top',
		qs: {
			limit: 3
		}
	}, function(error, response, body) {
		res.send(body)
	})
}

// Gets details on specific games
function querySpecificGames(res) {
	baseRequest.get({
		uri: 'helix/games',
		qs: {
			// name: ['always on']
			id: [394568, 495636, 499973]	//Same as above, but the ID form
		}
	}, function(error, response, body) {
		
		buildGameList(JSON.parse(response.body).data);

		queryGameStreamers(res);
	})
}

function buildGameList(gameArray) {

	gameArray.forEach(function(game) { setGame(game); })
	return games;
}

function setGame(game) {
	games.set(game.id, new Game(game));
}

function buildStreamerList(streamerArray) {
	streamerArray.forEach(function(streamer) { setStreamer(streamer); })
	return streamers;
}

function setStreamer(streamer) {
	streamers.set(streamer.user_id, new Streamer(streamer));
}