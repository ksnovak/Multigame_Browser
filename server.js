
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

	//TODO: This re-initialization is done because the maps stay populated between service calls
	//Ideally that's good. We just need to figure out how to handle that
	
	games = new Map();
	streamers = new Map();
	
	querySpecificGames(res, req.query);		//TODO: Async calls
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
		buildStreamerList(JSON.parse(body).data);

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
		
		
		if (data) {
			data.forEach(function(streamer) {
				let streamerObject = streamers.get(Number(streamer.id));
				streamerObject.setName(streamer.login);

				streamers.set(streamer.id, streamerObject);
			})
		}

		generateHTML(res);

	})
}

function generateHTML(res) {
	const StreamWidth = 230;
	const StreamAspectRatio = 1.75;

	const GameWidth = 90;
	const GameAspectRatio = 0.75;

	res.render('home', {
		helpers: {
			eachInMap: function (map, block) {
				let output = '';
  
				for (const [ key, value ] of map) {
				  output += block.fn({ key, value });
				}
			  
				return output;
			},
			getGameName: (game_id) =>  games.get(game_id).name,
			getGameArt: (game_id) => changeImagePlaceholders(games.get(game_id).box_art_url, GameWidth, GameAspectRatio),
			getStreamArt: (thumbnail_url) => changeImagePlaceholders(thumbnail_url, StreamWidth, StreamAspectRatio)

		},
		games: games,
		streamers: streamers
	});
}

function changeImagePlaceholders(image_url, width, ratio) {
	return image_url.replace("{width}", width).replace('{height}', parseInt(width/ratio));
}

// Gets the most popular games
function queryTopGames(res) {
	baseRequest.get({
		uri: 'kraken/games/top',
		qs: {
			limit: 10
		}
	}, function(error, response, body) {
		res.send(body)
	})
}

// Gets details on specific games
function querySpecificGames(res, queryString) {

	let qs = {}
	if (queryString) {
		if (queryString.name)
			qs.name = queryString.name;
		
		if (queryString.id)
			qs.id = queryString.id;
	}

	if (qs == {}) {
		qs.name = 'Always On'
	}

	baseRequest.get({
		uri: 'helix/games',
		qs: qs
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
	games.set(Number(game.id), new Game(game));
}

function buildStreamerList(streamerArray) {
	streamerArray.forEach(function(streamer) { setStreamer(streamer); })
	return streamers;
}

function setStreamer(streamer) {
	streamers.set(Number(streamer.user_id), new Streamer(streamer));
}