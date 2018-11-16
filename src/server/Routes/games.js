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

async function getTopGames(params, next) {
  const options = QueryOptions.cleanIncomingQueryOptions('/games/top', params);
  if (options.include_top === false) {
    return [];
  }
  const results = await RoutesUtils.commonTwitchRequest({
    uri: '/helix/games/top',
    options,
    rejectErrors: true,
    next
  });
  return gamesFromData(results);
}

async function getSpecificGames(params, next, isSelected = false) {
  const options = QueryOptions.cleanIncomingQueryOptions('/games/specific', params);

  if (!options.game && !options.game_id) {
    return [];
  }
  const results = await RoutesUtils.commonTwitchRequest({
    uri: '/helix/games',
    options,
    rejectErrors: true,
    next
  });

  console.log(results);

  return gamesFromData(results, isSelected);
}

async function getTopAndSpecificGames(options, next) {
  // Make the two separate calls to the Twitch API
  const [specificResult, topResult] = [
    await getSpecificGames(options, next, true),
    await getTopGames(options, next)
  ];

  return utils.combineArraysWithoutDuplicates(specificResult, topResult, 'id');
}

/* Get details for top games
    Querystring params: first, after
    https://dev.twitch.tv/docs/api/reference/#get-top-games
*/
router.get('/top', async (req, res, next) => {
  try {
    const results = await getTopGames(req.query, next);
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
    const results = await getSpecificGames(req.query, next, true);
    res.send(results);
  }
  catch (err) {
    next(err);
  }
});

router.get('/combo', async (req, res, next) => {
  try {
    const options = QueryOptions.cleanIncomingQueryOptions('/games/combo', req.query);

    if (!options.game_id && !options.game && !options.include_top) {
      res.send([]);
    }
    else {
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
