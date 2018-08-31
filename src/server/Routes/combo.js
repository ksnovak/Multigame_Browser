import express from 'express';
import QueryOptions from '../Models/QueryOptions';
import Games from './games';
import Streams from './streams';

require('dotenv').config();

const router = express.Router();

async function getGamesAndStreams(options, next) {
  const gamesOptions = QueryOptions.cleanIncomingQueryOptions('/games/combo', options);

  const gamesResult = await Games.getTopAndSpecificGames(gamesOptions, next);

  const streamsOptions = QueryOptions.cleanIncomingQueryOptions('/streams/list', options);

  if (gamesResult.length) {
    const gameIDs = gamesResult.filter(game => game.selected).map(game => game.id);

    streamsOptions.game_id = gameIDs.concat(streamsOptions.game_id);
  }

  const streamsResult = await Streams.getTopAndSpecificStreams(streamsOptions, next);
  return { games: gamesResult, streams: streamsResult };
}

router.get('/', async (req, res, next) => {
  try {
    const options = QueryOptions.cleanIncomingQueryOptions('/combo', req.query);

    const results = await getGamesAndStreams(options, next);

    res.send(results);
  }
  catch (err) {
    next(err);
  }
});

module.exports = {
  router,
  getGamesAndStreams
};
