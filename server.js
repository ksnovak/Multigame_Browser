
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
				}, {key: 'login', values: arrayFromParameterString(req.query.exclude, {toLowerCase: true, removeDuplicates: true})})
				.then(streamsMap => {
					console.log('asdfad')

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
			res.render('home', generateTemplate(details.games, details.streams, {
				language: req.query.language, 
				includeTop: req.query.includeTop, 
				exclude: req.query.exclude, 
				include: req.query.include
			}));
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
async function handleIncludedStreamers(streams, games, include) {
	
		//Given the map of streams already obtained, and the "include" querystring, find a list of users who we need to go and separately grab.
		//This will filter out any duplicates in the "include" list itself, as well as duplicates between the two sets. 
		let neededStreams = getNeededNewStreams(streams, include);

		if (neededStreams.length) {
			//If there are still some included streamers whose info we need, then query it
			let newStreams = await queryStreams({user_login: neededStreams})

			if (newStreams.size > 0) { //(arrays use .length but maps use .size)

				// Look at this new list of streamers, are they playing games that we don't have data on yet?
				let neededGames = [];
				newStreams.forEach(stream => {
					if (!games.has(stream.game_id)) {
						neededGames.push(stream.game_id);
					}
				})

				//Wait until after finding the needed games for performance's sake. Combine now in case there are new streamers but not new games
				streams = combineMaps(newStreams, streams);

				//There are new streamers found from the "include" list, but they're playing games that we don't have data on yet. So query for those game details.
				if (neededGames.length > 0) {				
					let data = await queryGamesSpecific({id: neededGames});
					return ({games: combineMaps(games, data), streams: streams})
				}
			}
		}

		return ({streams, games})		
}


//Passing in the streams object, and the include string, return an array of unique new users who need to be found.
function getNeededNewStreams(streams, include) {

	let newInclude = []
	//Exit early: Nothing to include listed
	if (include && include.length) {
		// Take the "include" querystring and make an array out of it. We're also filtering out duplicates from that querystring
		newInclude = arrayFromParameterString(include, {toLowerCase: true, removeDuplicates: true});
		
		//Look at the list of streamers we already got. Figure out which of our desired streamers aren't in that list (because we need to get their details)
		if (streams) {
			newInclude = newInclude.filter(name => { return (getStreamersNames(streams).indexOf(name) == -1) })
		}
	}

	return newInclude;
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

function removeDuplicatesInArray(arr) {
	return Array.from(new Set(arr))
}

//Given a querystring parameter, turn it into an Array. Optionally convert it to lowercase
function arrayFromParameterString(parameter, options = {toLowerCase: false, removeDuplicates: false}) {
	
	if (!parameter) {
		return null;
	}		
	else if (typeof parameter == 'string') {
		return options.toLowerCase ? Array(parameter.toLowerCase()) : Array(parameter);
	}
	else { //An array already
		let arr = parameter;

		if (options.toLowerCase) 
			arr.map(elem => elem.toLowerCase());

		if (options.removeDuplicates)
			arr = Array.from(new Set(arr));	//Sets are objects that only allow for unique values. Works as a duplicate-remover in ES6. 
		
		return arr;
	}
}

//Turn an array into a string if possible, joined by ", "
function stringFromArray(arr, options = {joinString: ', ', toLowerCase: false, removeDuplicates: false}) {

	if (!arr)
		return null;

	else if (typeof arr == 'string')
		return options.toLowerCase ? arr.toLowerCase() : arr;

	else {
		//Converting to lowercase as an array because we need to do that in order to remove dupliates appropriately
		if (options.toLowerCase) {
			arr = arr.map(elem => elem.toLowerCase());
		}

		if (options.removeDuplicates) {
			arr = Array.from(new Set(arr))
		}
	}

	return arr.join(options.joinString);
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
		include: stringFromArray(options.include, {toLowerCase: true, removeDuplicates: true}),
		exclude: stringFromArray(options.exclude, {toLowerCase: true, removeDuplicates: true}),
		gridView: true,
		repo: package.repo_root
	});
}

function changeImagePlaceholders(image_url, width, ratio) {
	return image_url.replace("{width}", width).replace('{height}', parseInt(width/ratio));
}
