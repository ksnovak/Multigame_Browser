import express from 'express';
import QueryOptions from '../Models/QueryOptions';
import Games from './games';
import Streams from './streams';
import utils from '../../utils';

require('dotenv').config();

const router = express.Router();

async function getGamesAndStreams(options, next) {
  // First, search for the specified games
  const gamesOptions = QueryOptions.cleanIncomingQueryOptions('/games/combo', options);
  let gamesResult = await Games.getTopAndSpecificGames(gamesOptions, next);

  // Then, search for the users (directly named and from the Game results)
  const streamsOptions = QueryOptions.cleanIncomingQueryOptions('/streams/list', options);
  if (gamesResult.length) {
    const gameIDs = gamesResult.filter(game => game.selected).map(game => game.id);

    streamsOptions.game_id = gameIDs.concat(streamsOptions.game_id);
  }
  const streamsResult = await Streams.getTopAndSpecificStreams(streamsOptions, next);

  // Then, make sure that we have data on all of the necessary games.
  // Look at all of the game_id's in the streams we've gotten, and see if any of them don't have a counterpart in the gamesResult array.
  const neededGames = streamsResult
    .map(stream => stream.game_id)
    .filter(game_id => gamesResult.map(game => game.id).indexOf(game_id) === -1);

  // If some were found, then get just those from Twitch
  if (neededGames.length > 0) {
    const additionalGames = await Games.getSpecificGames({ game_id: neededGames }, next);
    // Merge the results into the existing gamesResult array
    gamesResult = utils.combineArraysWithoutDuplicates(gamesResult, additionalGames, 'id');
  }

  return { games: gamesResult, streams: streamsResult, pagination: streamsResult.gamePagination };
}

router.get('/', async (req, res, next) => {
  try {
    const results = await getGamesAndStreams(req.query, next);

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
