/* Router for handling Game API details

*/

import express from 'express';
import Game from '../Models/Game';
import QueryOptions from '../Models/QueryOptions';
import RoutesUtils from './routeUtils';
import utils from '../../utils';

require('dotenv').config();

const router = express.Router();

function gamesFromData(body, selected) {
  try {
    const gamesArray = body.data.map(game => new Game(game, selected));

    return utils.removeArrayDuplicates(gamesArray, 'id');
  }
  catch (ex) {
    throw ex;
  }
}

router.get('/', (req, res) => {
  res.send('games home');
});

async function getTopGames(uri, qs, next) {
  if (qs.include_top === false) {
    return [];
  }
  const results = await RoutesUtils.commonTwitchRequest({
    uri,
    qs,
    rejectErrors: true,
    next
  });
  return gamesFromData(results);
}

async function getSpecificGames(uri, qs, next) {
  if (!qs.game_name && !qs.game_id) {
    return [];
  }
  const results = await RoutesUtils.commonTwitchRequest({
    uri,
    qs,
    rejectErrors: true,
    next
  });

  return gamesFromData(results, true);
}

async function getTopAndSpecificGames(options, next) {
  // Make the two separate calls to the Twitch API
  const [specificResult, topResult] = [
    await getSpecificGames('/helix/games', options, next),
    await getTopGames('/helix/games/top', options, next)
  ];

  return utils.combineArraysWithoutDuplicates(specificResult, topResult, 'id');
}

/* Get details for top games
    Querystring params: first, after
    https://dev.twitch.tv/docs/api/reference/#get-top-games
*/
router.get('/top', async (req, res, next) => {
  try {
    const results = await getTopGames(
      '/helix/games/top',
      QueryOptions.cleanIncomingQueryOptions('/games/top', req.query),
      next
    );
    res.send(results || []);
  }
  catch (err) {
    next(err);
  }
});

/*  Get details for specific games
    Querystring params: id, name
    https://dev.twitch.tv/docs/api/reference/#get-games
*/
router.get('/specific', async (req, res, next) => {
  try {
    const options = QueryOptions.cleanIncomingQueryOptions('/games/specific', req.query);

    const results = await getSpecificGames('/helix/games', options, next);
    res.send(results);
  }
  catch (err) {
    next(err);
  }
});

router.get('/combo', async (req, res, next) => {
  try {
    const options = QueryOptions.cleanIncomingQueryOptions('/games/combo', req.query);

    if (!options.id && !options.name && !options.include_top) {
      res.send([]);
    }
    else {
      // If include_top wasn't passed, then we're going to set it to false.
      if (options.include_top == undefined) {
        options.include_top = false;
      }
      const results = await getTopAndSpecificGames(options, next);
      res.send(results);
    }
  }
  catch (err) {
    next(err);
  }
});

module.exports = {
  router,
  getTopGames,
  getSpecificGames,
  getTopAndSpecificGames
};
