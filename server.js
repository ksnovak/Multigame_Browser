
// const config 		= require('./config');
// const keys 			= require('./keys');
const express		= require('express');
const exphbs		= require('express-handlebars');
const app			= express();
const bodyParser	= require('body-parser');
// const request 		= require('request');
//var sql 		= require('sql');

const GameRouter 	= require('./routes/games');
const StreamRouter	= require('./routes/streams');

// let Game 			= require('./models/game');
// let Stream 			= require('./models/stream');


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

	//Re-query list of streams, followed by list of games as needed, for the Include list
	.then(data => {
		let games = combineMapsAndSelect(data[0], (data[1]? data[1].games : null));
		let streams = data[1] ? removeExcludedStreamers(data[1].streams, req.query.exclude) : null;

		handleIncludedStreamers(streams, games, req.query.include)
		.then (details => {
			console.log('oh we here');

			//Once you have top + specific details, combine as appropriate and render the page
			res.render('home', generateTemplate(details.games, details.streams, {language: req.query.language, includeTop: req.query.includeTop, exclude: req.query.exclude}));
		})
	})
})


function removeExcludedStreamers (streams, exclude) {
	if (exclude) {
		exclude = arrayFromParameterString(exclude);
		streams.forEach(stream => {
			let index = exclude.indexOf(stream.login);
			if (index > -1) 
				streams.delete(stream.user_id);
		})
	}
	return streams;
}

function handleIncludedStreamers(streams, games, include) {

	return new Promise((resolve, reject) => {
		if (!include || include.length == 0) {
			console.log('1')
			resolve({streams, games})
		}

		//TODO: Handle duplicate inclusions
		let newInclude = arrayFromParameterString(include, true);
		
		//Iterate through 'streams', weeding users out of 'include'. if any remain, have to re-query
		if (streams) {
			streams.forEach(stream => {
				let index = newInclude.indexOf(stream.login);
				if (index > -1) {
					newInclude.splice(index, 1);
				}
			})
		}

		//If there's nothing left after the weeding out, break early.
		if (newInclude.length == 0) {
			console.log('2')
			resolve({streams, games})

		}

		
		//Otherwise, re-query streamer list
		queryStreamsForSpecificUsers(newInclude).then(newStreams => {
			//Check if there are any games from the Included list, that aren't in 'games'. If so, re-query similarly.
			if (newStreams.size == 0) {
				console.log('3')
				resolve({streams, games})
			}

			let neededGames = [];

			newStreams.forEach(stream => {
				if (!games.has(stream.game_id)) {
					neededGames.push(stream.game_id);
				}
			})

			//TODO: Re-order based on viewer count.
			//Right now this shows all from `newStreams`, followed by all from `streams`. That's better than the other way around, but not ideal
			let combinedStreams = combineMaps(newStreams, streams);

			if (neededGames.length == 0) {
				console.log('4')
				resolve({games, combinedStreams});
			} 
			else {
				queryGamesSpecific({id: neededGames})
				.then(data => {
					console.log('5')
					resolve({
						games: combineMapsAndSelect(games, data), 
						streams: combinedStreams
					});
				})	
			}
		})
	})

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
					resolve(mapFromArray(gamesArray))
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
			resolve(mapFromArray(gamesArray));
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
			first: queryString.first || 100
		})
		.then(streamsArray => {
			resolve({
				streams: mapFromArray(streamsArray, 'user_id', {key: 'login', values: arrayFromParameterString(queryString.exclude, true)}), 
				games: games
			});
		})
	})	
}

async function queryStreamsForSpecificUsers(users/*, queryString*/) {
	let streamsArray = await StreamRouter.queryStreamsForSpecificGames({
		user_login: users
	})
	return mapFromArray(streamsArray, 'user_id');
}


// --------------------------------------------
// Helper functions

// --------------------------------------------

/* Combines two maps (without duplicate IDs/elements)
 * "keyName" is the key to set for the Map element; 'id' is default
 * "flag" is for some value to set, which specifies that the element came from the Additional set
*/
function combineMaps(baseMap, additionalMap, keyName = 'id', flag) {
	let combinedMaps = baseMap || new Map();

	if (additionalMap) {
		additionalMap.forEach(elem => {
			if (flag && flag.name) //flag.val could potentially be 'false' so testing for that isn't reasonable
				elem[flag.name] = flag.val;

			combinedMaps.set(elem[keyName], elem);
		})
	}

	return combinedMaps;
}

// Specialized version of combineMaps, where the flag is .selected = true
function combineMapsAndSelect(baseMap, additionalMap, keyName = 'id') {
	return combineMaps(baseMap, additionalMap, keyName, {name: 'selected', val: true})
}

/* Turn the given array into a map.
 * The key will be 'id' by default, or whatever otherwise specified
 * This will also filter out any elements that fit the exclusion clause.
 
*/
function mapFromArray(arr, key = 'id', exclude = null) {
	let newMap = new Map();

	if (arr) {
		//If the 'exclude' isn't specified, we can shortcut some logic
		const needFilter = (exclude && exclude.values && exclude.key)

		arr.forEach(elem => { 
			//If exclude is null, or if it's missing either a "key" or "values" member, 
			if (!needFilter || !exclude.values.includes(elem[exclude.key]))
				newMap.set(Number(elem[key]), elem)
		})	
	}

	return newMap;
}

//Given a querystring parameter, turn it into an Array. Optionally convert it to lowercase
function arrayFromParameterString(parameter, toLowerCase = false) {
	if (!parameter)
		return null;

	else if (typeof parameter == 'string')
		return toLowerCase? Array(parameter.toLowerCase()) : Array(parameter);
		
	else 
		return toLowerCase? parameter.map(elem => elem.toLowerCase()) : parameter;
}

//Turn an array into a string if possible, joined by ", "
function stringFromArray(arr, joinString = ', ') {
	if (!arr)
		return null;

	else if (typeof arr == 'string')
		return arr;

	else 
		return arr.join(joinString);
}

//Check if a string value matches "true" (e.g. boolean string). 
//defaultVal used for empty strings, whether an empty string counts as true or false
function stringIsTrue(str, defaultVal = false) {
	return (str && str.toLowerCase() == 'true') || (!str && defaultVal);
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
		exclude: stringFromArray(options.exclude),
		gridView: true
	});
}

function changeImagePlaceholders(image_url, width, ratio) {
	return image_url.replace("{width}", width).replace('{height}', parseInt(width/ratio));
}
