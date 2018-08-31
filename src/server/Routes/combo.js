
import express from 'express';
import QueryOptions from '../Models/QueryOptions';
import RoutesUtils from './routeUtils';
import Games from './games'
import Streams from './streams'

require('dotenv').config();

const router = express.Router();

async function getGamesAndStreams(options, next) {
	const gamesOptions = QueryOptions.cleanIncomingQueryOptions('/games/combo', options);
	const gamesResult = await Games.getTopAndSpecificGames(gamesOptions, next)

	const streamsOptions = QueryOptions.cleanIncomingQueryOptions('/streams/list', options);
	if (gamesResult.length)
		streamsOptions.game_id = (streamsOptions.game_id || []).concat(gamesResult.filter(game => game.selected).map(game => game.id))

	const streamsResult = await Streams.getStreams(streamsOptions, next);
	return { games: gamesResult, streams: streamsResult }
}

router.get('/', async (req, res, next) => {
	const options = QueryOptions.cleanIncomingQueryOptions('/combo', req.query);

	if (options.includetop === undefined) {
		options.includetop = false;
	}

	try {
		const results = await getGamesAndStreams(options, next);
		res.send(results)
	}
	catch (err) {
		next(err)
	}
});


module.exports = {
	router,
	getGamesAndStreams
};
