/* Router for handling Game API details

*/

import express from 'express';
import Game from '../Models/Game';
import QueryOptions from '../Models/QueryOptions';
import RoutesUtils from './routeUtils';

require('dotenv').config();

const router = express.Router();

function gamesFromData(body, selected) {
  try {
    return body.data.map(game => new Game(game, selected));
  } catch (ex) {
    throw ex;
  }
}

router.get('/', (req, res) => {
  res.send('games home');
});

async function getTopGames(uri, qs, next) {
  if (qs.includetop === false) {
    return ([])
  }
  else {
    const results = await RoutesUtils.commonTwitchRequest({
      uri, qs, rejectErrors: true, next
    });
    return gamesFromData(results);
  }
}

async function getSpecificGames(uri, qs, next) {
  if (!qs.name && !qs.id) {
    return ([])
  }
  else {
    const results = await RoutesUtils.commonTwitchRequest({
      uri, qs, rejectErrors: true, next
    })

    return gamesFromData(results, true);
  }
}

async function getTopAndSpecificGames(options, next) {

  //Make the two separate calls to the Twitch API
  const [specificResult, topResult] = [await getSpecificGames('/helix/games', options, next), await getTopGames('/helix/games/top', options, next)];



  //If either one of the two came bacck with no results, then we an use a shortcut to return what is there
  if (!specificResult.length || !topResult.length) {
    return specificResult.length ? specificResult : topResult;
  }

  //Otherwise, we got both as results, so we need to carefully combine (and avoid duplicates)
  else {
    let combined = [];

    // Start with the Specific games, because those are more important to the user. Put them in the "combined" array
    combined = specificResult;

    //Go through the list of Top games, and add all to Combined which aren't yet in there.
    topResult.forEach(topGame => {
      //Because it's an array of objects, we first turn it into an array of just IDs, and grab the appropriate index from that.
      let index = combined.map(game => { return game.id }).indexOf(topGame.id)

      //If the game wasn't found, then add it.
      if (index === -1) {
        combined.push(topGame);
      }
    })

    return combined;
  }



}

/* Get details for top games
    Querystring params: first, after
    https://dev.twitch.tv/docs/api/reference/#get-top-games
*/
router.get('/top', async (req, res, next) => {
  try {
    const results = await getTopGames(
      '/helix/games/top',
      QueryOptions.getValidQueryOptions('/games/top', req.query),
      next
    );
    res.send(results || [])
  } catch (err) {
    next(err)
  }
});

/*  Get details for specific games
    Querystring params: id, name
    https://dev.twitch.tv/docs/api/reference/#get-games
*/
router.get('/specific', async (req, res, next) => {
  try {

    const options = QueryOptions.getValidQueryOptions(
      '/games/specific',
      req.query
    );

    const results = await getSpecificGames('/helix/games', options, next)
    res.send(results)

  } catch (err) {
    next(err)
  }
});

router.get('/combo', async (req, res, next) => {
  try {
    const options = QueryOptions.getValidQueryOptions(
      '/games/combo',
      req.query
    );

    if (!options.id && !options.name && !options.includetop) {
      res.send([]);
    }
    else {
      //If includetop wasn't passed, then we're going to set it to false.
      if (options.includetop == undefined) {
        options.includetop = false;
      }
      const results = await getTopAndSpecificGames(options, next);
      res.send(results)
    }
  } catch (err) {
    next(err)
  }

});

module.exports = router;
