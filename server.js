
const config 		= require('./config');
const keys 			= require('./keys');
const express		= require('express');
const exphbs		= require('express-handlebars');
const app			= express();
const bodyParser	= require('body-parser');
const request 		= require('request');
//var sql 		= require('sql');

const GameRouter 	= require('./routes/games');
const StreamRouter	= require('./routes/streams');

let Game 			= require('./models/game');
let Stream 			= require('./models/stream');


let router = express.Router();

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

	Promise.all([queryGamesTop(req.query),
		queryGamesSpecific(req.query)
			.then(games => { return queryStreamsForSpecificGames(games) })
			.then(data => { return queryStreamsDetails(data.games, data.streams) })
	])
	.then(data => {
		let games = combineGames(data[0], data[1].games);	//Combines Top Games and Specific Games
		let streams = data[1].streams;

		res.render('home', generateTemplate(games, streams));
	})
})

function combineGames(topGames, selectedGames) {
	let combinedGames = topGames;

	selectedGames.forEach(game => {
		game.selected = true;
		combinedGames.set(game.id, game);
	})

	return combinedGames;
}

require('./routes/games')(router);
require('./routes/streams')(router);

app.use('/static', express.static('static'));
app.use('/api', router);
app.listen(3000);1

// --------------------------------------------
// Gets the most popular games
function queryGamesTop(queryString) {
	return new Promise((resolve, reject) => {
		GameRouter.queryTopGames(queryString)
			.then((gamesArray) => {
				let games = new Map();
				gamesArray.forEach(game => { games.set(game.id, game)})
				resolve(games)
			})
	})
}

// Gets details on specific games
function queryGamesSpecific(queryString) {
	return new Promise((resolve, reject) => {
		GameRouter.querySpecificGames(queryString)
		.then((gamesArray) => {
			resolve(buildGameList(gamesArray));
		})
	})
}

// Gets the most popular streams for a specific game
function queryStreamsForSpecificGames(games) {
	return new Promise((resolve, reject) => {
		StreamRouter.queryStreamsForSpecificGames({
			game_id: Array.from(games.keys()),
			language: 'en',
			first: 100
		})
		.then(streamsArray => {
			let streams = new Map();
			streamsArray.forEach(stream => {streams.set(stream.user_id, stream)})
			resolve({streams: streams, games: games});
		})
	})	
}

// Gets details on specified streams
function queryStreamsDetails(games, streams) {
	return new Promise((resolve, reject) => {
		StreamRouter.queryStreamsDetails({
			id: Array.from(streams.keys())
		})
		.then(streamsArray => {
			streamsArray.forEach(stream => {				
				let streamObject = streams.get(stream.user_id);
				streamObject.setName(stream.login);
	
				streams.set(stream.user_id, streamObject);
			})
			resolve({games: games, streams: streams});
		})
	})
}
// --------------------------------------------



// --------------------------------------------
// Interpreting service call returns
function buildGameList(gameArray) {
	let games = new Map();
	if (gameArray)
		gameArray.forEach(game => { games.set(Number(game.id), game) })

	return games;
}

function buildStreamList(streamArray) {
	streamArray.forEach(stream => { setStream(stream) })
	return streams;
}

function setStream(stream) {
	streams.set(Number(stream.user_id), new Stream(stream));
}
// --------------------------------------------


// --------------------------------------------
// Building structures to send to client
function generateTemplate(games, streams) {
	const StreamWidth = 230;
	const StreamAspectRatio = 1.75;

	const GameWidth = 90;
	const GameAspectRatio = 0.75;

	return({
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