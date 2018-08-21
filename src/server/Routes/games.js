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

router.use((req, res, next) => {
  console.log('Games api!');
  next();
});

router.get('/', (req, res) => {
  res.send('games home');
});

/* Get details for top games
    Querystring params: first, after
    https://dev.twitch.tv/docs/api/reference/#get-top-games
*/
router.get('/top', (req, res) => {
  baseRequest.get(
    {
      uri: 'helix/games/top',
      qs: req.query
    },
    (error, response, body) => {
      if (error) throw Errors.fileNotFound;

      res.json(body);
    }
  );
});

/*  Get details for specific games
    Querystring params: id, name
    https://dev.twitch.tv/docs/api/reference/#get-games
*/
router.get('/specific', (req, res) => {
  baseRequest.get(
    {
      uri: 'helix/games',
      qs: req.query
    },
    (error, response, body) => {
      if (error) throw Errors.fileNotFound;

      res.json(body);
    }
  );
});

module.exports = router;
