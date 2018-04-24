
const config 		= require('./config');
const keys 			= require('./keys');
const express		= require('express');
const exphbs		= require('express-handlebars');
const app			= express();
const bodyParser	= require('body-parser');
const request 		= require('request');
//var sql 		= require('sql');

const GameRouter 	= require('./routes/games');

let Game 			= require('./models/game');
let Stream 			= require('./models/stream');


let router = express.Router();

let games = new Map();
let streams = new Map();

let baseRequest = request.defaults({
	headers: keys.twitch,
	baseUrl: 'https://api.twitch.tv/'
})

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());


router.use(function(req, res, next) {
	console.log(`Request for ${req.originalUrl} incoming`)
	next();
})

//Note this is APP get, so this responds to root directory, not
app.get('/', function(req, res) {

	//TODO: This re-initialization is done because the maps stay populated between service calls
	//Ideally that's good. We just need to figure out how to handle that
	games = new Map();
	streams = new Map();
	
	queryGamesSpecific(res, req.query);		//TODO: Async calls
})

require('./routes/games')(router);

app.use('/api', router);
app.listen(3000);




// --------------------------------------------
// Service calls

// Gets the most popular streams for a specific game
function queryStreamsForSpecificGames(res) {
	baseRequest.get({
		uri: 'helix/streams',
		qs: {
			game_id: Array.from(games.keys()),
			language: 'en',
			first: 100
		}
	}, function(error, response, body) {
		buildStreamList(JSON.parse(body).data);

		queryStreamsDetails(res);
	})
}

// Gets details on specified streams
function queryStreamsDetails(res) {
	baseRequest.get({	
		uri: 'helix/users',
		qs: {
			id: Array.from(streams.keys())
		}
	}, function(error, response, body) {

		let data = JSON.parse(body).data; 	
		if (data) {
			data.forEach(function(stream) {
				let streamObject = streams.get(Number(stream.id));
				streamObject.setName(stream.login);

				streams.set(Number(stream.id), streamObject);
			})
		}

		generateHTML(res);

	})
}

// Gets the most popular games
function queryGamesTop(res) {
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
function queryGamesSpecific(res, queryString) {
	GameRouter.querySpecificGames(queryString)
		.then((gamesArray) => {
			gamesArray.forEach((game) => { games.set(game.id, game); })
			queryStreamsForSpecificGames(res); 
		})
}
// --------------------------------------------



// --------------------------------------------
// Interpreting service call returns
function buildGameList(gameArray) {
	if (gameArray)
		gameArray.forEach(function(game) { setGame(game); })

	return games;
}

function setGame(game) {
	games.set(Number(game.id), new Game(game));
}

function buildStreamList(streamArray) {
	streamArray.forEach(function(stream) { setStream(stream); })
	return streams;
}

function setStream(stream) {
	streams.set(Number(stream.user_id), new Stream(stream));
}
// --------------------------------------------


// --------------------------------------------
// Building structures to send to client
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
			getGameName: (game_id) => {
				
				const game = games.get(game_id)
				return game ? game.name : 'Unknown'
			},
			getGameArt: (game_id) => {
				const game = games.get(game_id)
				return game ? changeImagePlaceholders(game.box_art, GameWidth, GameAspectRatio) : ''
			},
			getGame: (game_id) => games.get(game_id),
			getStreamArt: (thumbnail_url) => changeImagePlaceholders(thumbnail_url, StreamWidth, StreamAspectRatio)

		},
		games: games,
		streams: streams,
		gridView: true
	});
}

function changeImagePlaceholders(image_url, width, ratio) {
	return image_url.replace("{width}", width).replace('{height}', parseInt(width/ratio));
}
// --------------------------------------------