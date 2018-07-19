
// const config 		= require('./config');
// const keys 			= require('./keys');
const express		= require('express');
const exphbs		= require('express-handlebars');
const app			= express();
const bodyParser	= require('body-parser');
const package 		= require('./package.json')
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
			.then(games => { 
				if (!games)
					return null;

				return queryStreams({
					game_id: Array.from(games.keys()),
					language: req.query.language,
					first: (req.query.first || 20)
				}, {key: 'login', values: arrayFromParameterString(req.query.exclude, true)})
				.then(streamsMap => {
					return ({streams: streamsMap, games: games})
				})
			})
	])

	//Re-query list of streams, followed by list of games as needed, for the Include list
	.then(data => {
		let games = combineMapsAndSelect(data[0], (data[1]? data[1].games : null));
		let streams = data[1] ? data[1].streams : null;

		handleIncludedStreamers(streams, games, req.query.include)
		.then (details => {
			//Once you have top + specific details, combine as appropriate and render the page
			res.render('home', generateTemplate(details.games, details.streams, {language: req.query.language, includeTop: req.query.includeTop, exclude: req.query.exclude}));
		})
	})
})

function getStreamersNames(streams) {
	let nameArray = [];
	streams.forEach(stream => {
		nameArray.push(stream.login)
	})

	return nameArray;
}


require('./routes/games')(router);
require('./routes/streams')(router);

app.use('/static', express.static('static'));
app.use('/api', router);
app.listen(3000);

// --------------------------------------------
// Gets the most popular games
async function queryGamesTop(queryString) {

	if (queryString.includeTop && stringIsTrue(queryString.includeTop, true)) 
		return mapFromArray(await GameRouter.queryTopGames(queryString));

	else
		return null;
}

// Gets details on specific games
async function queryGamesSpecific(queryString) {
		//If no game is specified (by name or ID), break out early.
		if (!queryString || !(queryString.name || queryString.id)) 
			return null;

		else
			return mapFromArray(await GameRouter.querySpecificGames(queryString))
}

// Get streams for the given options, filtering out any exclusions 
async function queryStreams(options, exclude = null) {
	let streamsArray = await StreamRouter.queryStreamsForSpecificGames(options)
	return mapFromArray(streamsArray, 'user_id', exclude)
}


// Given maps of streams and games, and an array of names,
// find which names are not in the stream map, and search for their stream details
// if any of them are playing games NOT in our "games" map, query for those games' details too
function handleIncludedStreamers(streams, games, include) {
	return new Promise((resolve, reject) => {

		//Exit early: Nothing to include listed
		if (!include || include.length == 0)
			resolve({streams, games})

		// Take the "include" querystring and make an array out of it
		let newInclude = arrayFromParameterString(include, true);
		
		//Look at the list of streamers we already got. Figure out which of our "include"d streamers aren't in that list (because we need to get their details)
		if (streams) {
			streams.forEach(stream => {
				let index = newInclude.indexOf(stream.login);
				if (index > -1) {
					newInclude.splice(index, 1);
				}
			})
		}

		//Exit early: All included streams were obtained via the main query
		if (newInclude.length == 0)
			resolve({streams, games})
		
		//If there are still some included streamers whose info we need, then query it
		queryStreams({user_login: newInclude}).then(newStreams => {
			
			//Exit early: We queried those remaining names, but none of them are streaming.
			if (newStreams.size == 0) {
				resolve({streams, games})
			}

			// Look at this new list of streamers, are they playing games that we don't have data on yet?
			let neededGames = [];
			newStreams.forEach(stream => {
				if (!games.has(stream.game_id)) {
					neededGames.push(stream.game_id);
				}
			})

			//Right now this shows all from `newStreams`, followed by all from `streams`. That's better than the other way around, but not ideal
			let combinedStreams = combineMaps(newStreams, streams);

			//Exit early: We got the appropriate new set of streamers, and we don't need to get new game data, so we're done here
			if (neededGames.length == 0) {
				resolve({games, combinedStreams});
			} 

			//There are new streamers found from the "include" list, but they're playing games that we don't have data on yet. So query for those game details.
			else {
				queryGamesSpecific({id: neededGames})
				.then(data => {
					resolve({games: combineMapsAndSelect(games, data), streams: combinedStreams});
				})	
			}
		})
	})
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
		gridView: true,
		repo: package.repo_root
	});
}

function changeImagePlaceholders(image_url, width, ratio) {
	return image_url.replace("{width}", width).replace('{height}', parseInt(width/ratio));
}
