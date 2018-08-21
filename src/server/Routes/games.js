/* Router for handling Game API details

*/

import express from 'express';
import request from 'request';
import Game from '../Models/Game';
import Errors from '../Models/Errors';
require('dotenv').config();

const router = express.Router();

const baseRequest = request.defaults({
  headers: {
    'Client-ID': process.env.TWITCH_CLIENT_ID,
    Authorization: `Bearer ${process.env.TWITCH_CLIENT_SECRET}`
  },
  baseUrl: 'https://api.twitch.tv'
});

router.get('/', (req, res) => {
  res.send('games home');
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

/* Get details for top games
    Querystring params: first, after
    https://dev.twitch.tv/docs/api/reference/#get-top-games
*/
router.get('/top', (req, res, next) => {
  baseRequest.get(
    {
      uri: 'helix/games/top',
      qs: req.query
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
});

/*  Get details for specific games
    Querystring params: id, name
    https://dev.twitch.tv/docs/api/reference/#get-games
*/
router.get('/specific', (req, res, next) => {
  baseRequest.get(
    {
      uri: 'helix/games',
      qs: req.query
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
});

module.exports = router;
