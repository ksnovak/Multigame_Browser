
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

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());


router.use(function(req, res, next) {
	console.log(`Request for ${decodeURIComponent(req.originalUrl)} incoming`)
	next();
})

app.get('/', function(req, res) {

	//Get a list of top games, and get details on specified games, as appropriate.
	Promise.all([
		queryGamesTop(req.query),
		queryGamesSpecific(req.query)
			.then(games => { return games ? queryStreamsForSpecificGames(games, req.query) : null })
	])
	
	//Once you have top + specific details, combine as appropriate and render the page
	.then(data => {
		let games = combineGames(data[0], data[1]);
		let streams = data[1] ? removeExcludedStreamers(data[1].streams, req.query.exclude) : null;

		res.render('home', generateTemplate(games, streams, {language: req.query.language, includeTop: req.query.includeTop, exclude: req.query.exclude}));
	})
})

function combineGames(topGames, selectedDetails) {	
	let combinedGames = topGames || new Map();

	if (selectedDetails) {
		selectedDetails.games.forEach(game => {
			game.selected = true;
			combinedGames.set(game.id, game);
		})
	}

	return combinedGames;
}

function removeExcludedStreamers (streams, exclude) {
	if (exclude) {
		exclude = Array(exclude);
		streams.forEach(stream => {

			let index = exclude.indexOf(stream.login);

			if (index > -1) {
				exclude.splice(index, 1);
				streams.delete(stream.user_id);
			}
			
		})
	}
	return streams;
}

require('./routes/games')(router);
require('./routes/streams')(router);

app.use('/static', express.static('static'));
app.use('/api', router);
app.listen(3000);

// --------------------------------------------
// Gets the most popular games
function queryGamesTop(queryString) {
	return new Promise((resolve, reject) => {
		if (queryString.includeTop && stringIsTrue(queryString.includeTop, true)) {
			GameRouter.queryTopGames(queryString)
				.then((gamesArray) => {
					let games = new Map();
					gamesArray.forEach(game => { games.set(game.id, game)})
					resolve(games)
				})
		}
		else {
			resolve()
		}
	})
}

// Gets details on specific games
function queryGamesSpecific(queryString) {
	return new Promise((resolve, reject) => {
		GameRouter.querySpecificGames(queryString)
		.then((gamesArray) => {
			resolve(buildGameList(gamesArray));
		}, (error) => {
			resolve();
		})
	})
}

// Gets the most popular streams for a specific game
function queryStreamsForSpecificGames(games, queryString) {
	return new Promise((resolve, reject) => {
		StreamRouter.queryStreamsForSpecificGames({
			game_id: Array.from(games.keys()),
			language: queryString.language,
			exclude: queryString.exclude,
			include: queryString.include,
			first: queryString.first || 100
		})
		.then(streamsArray => {
			let streams = new Map();
			streamsArray.forEach(stream => {streams.set(stream.user_id, stream)})
			resolve({streams: streams, games: games});
		})
	})	
}

// Gets details on specified streams
function queryStreamsDetails(games, streams, queryString) {
	return new Promise((resolve, reject) => {
		StreamRouter.queryStreamsDetails({
			id: Array.from(streams.keys()),
			exclude: queryString.exclude,
			include: queryString.include
		})
		.then(streamsArray => {
			streamsArray.forEach(stream => {	
				let streamObject = streams.get(stream.user_id);
				streamObject.setName(stream.login);
				
				//If the user specified to exclude any streamers, this is where it happens
				if (queryString.exclude) {
					//See if the streamer is in the exclusion list. If so, remove them from the streams map, and also from the exclusion list.
					let index = queryString.exclude.indexOf(stream.login);
					if (index > -1) {
						streams.delete(stream.user_id)
						queryString.exclude.splice(index, 1)
					}
				}
				else {
					streams.set(stream.user_id, streamObject);
				}
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
function generateTemplate(games, streams, options) {
	const StreamWidth = 230;
	const StreamAspectRatio = 1.75;

	const GameWidth = 90;
	const GameAspectRatio = 0.75;
	
	return({
		helpers: {
			eachInMap: function (map, block) {
				let output = '';
  
				if (map) {
					for (const [ key, value ] of map) {
					output += block.fn({ key, value });
					}
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
		englishOnly: (options.language == 'en') ? true : false,
		includeTop: stringIsTrue(options.includeTop, true),
		exclude: options.exclude ? options.exclude.join(', ') : null,
		gridView: true
	});
}

function changeImagePlaceholders(image_url, width, ratio) {
	return image_url.replace("{width}", width).replace('{height}', parseInt(width/ratio));
}

//Check if a string value matches "true" (e.g. boolean string). 
//defaultVal used for empty strings, whether an empty string counts as true or false
function stringIsTrue(str, defaultVal = false) {
	return (str && str.toLowerCase() == 'true') || (!str && defaultVal);
}
// --------------------------------------------