/* Router for handling Game API details

*/

import express from 'express';
import request from 'request';
import Game from '../Models/Game';
import Errors from '../Models/Errors';
import QueryOptions from '../Models/QueryOptions';

require('dotenv').config();

const router = express.Router();

const baseRequest = request.defaults({
  headers: {
    'Client-ID': process.env.TWITCH_CLIENT_ID,
    Authorization: `Bearer ${process.env.TWITCH_CLIENT_SECRET}`
  },
  baseUrl: 'https://api.twitch.tv'
});

function gamesFromData(body) {
  try {
    const parsedBody = JSON.parse(body);

    if (parsedBody.error) throw parsedBody.error;

    return parsedBody.data.map(game => new Game(game));
  } catch (ex) {
    throw ex;
  }
}

const twitchEndpoints = {
  '/top': 'helix/games/top',
  '/specific': 'helix/games'
};

function makeGameRequest(req, res, next) {
  const localEndpoint = req.route.path;
  const options = QueryOptions.getValidQueryOptions(
    `/games${localEndpoint}`,
    req.query
  );

  baseRequest.get(
    {
      uri: twitchEndpoints[localEndpoint],
      qs: options
    },
    (error, response, body) => {
      if (error) {
        next(error);
      } else {
        try {
          res.send(gamesFromData(body));
        } catch (err) {
          next(err);
        }
      }
    }
  );
}

router.get('/', (req, res) => {
  res.send('games home');
});

/* Get details for top games
    Querystring params: first, after
    https://dev.twitch.tv/docs/api/reference/#get-top-games
*/
router.get('/top', makeGameRequest);

/*  Get details for specific games
    Querystring params: id, name
    https://dev.twitch.tv/docs/api/reference/#get-games
*/
router.get('/specific', makeGameRequest);

module.exports = router;
