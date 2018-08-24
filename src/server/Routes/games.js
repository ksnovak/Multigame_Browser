/* Router for handling Game API details

*/

import express from 'express';
import Game from '../Models/Game';
import QueryOptions from '../Models/QueryOptions';
import RoutesUtils from './routeUtils';

require('dotenv').config();

const router = express.Router();

function gamesFromData(body) {
  try {
    return body.data.map(game => new Game(game));
  } catch (ex) {
    throw ex;
  }
}

router.get('/', (req, res) => {
  res.send('games home');
});

/* Get details for top games
    Querystring params: first, after
    https://dev.twitch.tv/docs/api/reference/#get-top-games
*/
router.get('/top', (req, res, next) => {
  RoutesUtils.commonTwitchRequest({
    uri: '/helix/games/top',
    qs: QueryOptions.getValidQueryOptions('/games/top', req.query),
    rejectErrors: true,
    next,
    onResponse: (error, response, jsonData) => {
      try {
        res.send(gamesFromData(jsonData));
      } catch (err) {
        next(err);
      }
    }
  });
});

/*  Get details for specific games
    Querystring params: id, name
    https://dev.twitch.tv/docs/api/reference/#get-games
*/
router.get('/specific', (req, res, next) => {
  RoutesUtils.commonTwitchRequest({
    uri: '/helix/games/',
    qs: QueryOptions.getValidQueryOptions('/games/specific', req.query),
    rejectErrors: true,
    next,
    onResponse: (error, response, jsonData) => {
      try {
        res.send(gamesFromData(jsonData));
      } catch (err) {
        next(err);
      }
    }
  });
});

module.exports = router;
