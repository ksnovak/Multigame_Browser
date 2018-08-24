import express from 'express';
import request from 'request';
import Stream from '../Models/Stream';
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

const twitchEndpoints = {
  '/details': 'helix/users',
  '/games': 'helix/streams',
  '/top': 'helix/streams'
};

function streamsFromData(body) {
  try {
    const parsedBody = JSON.parse(body);

    if (parsedBody.error) throw parsedBody.error;

    return parsedBody.data.map(stream => new Stream(stream));
  } catch (ex) {
    throw ex;
  }
}

function makeGameRequest(req, res, next) {
  const localEndpoint = req.route.path;
  const options = QueryOptions.getValidQueryOptions(
    `/streams${localEndpoint}`,
    req.query
  );

  // Make sure that a game or user was specified. If not, return early with nothing.
  if (!(options.game_id || options.user_id || options.user_login)) {
    res.send([]);
  } else {
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
            res.send(streamsFromData(body));
          } catch (err) {
            next(err);
          }
        }
      }
    );
  }
}

/* Get details for specified users (Note: This even gets details on offline users)
    Querystring params: id, login
    https://dev.twitch.tv/docs/api/reference/#get-users
*/
router.get('/details', makeGameRequest);

/* Get list of live streams for specified games
    Querystring params: game_id, language, first
    WARNING: You can specify either the game, or the streamer. If you do both, it returns an inner join basically (all of the specified people, streaming the specified games)
    https://dev.twitch.tv/docs/api/reference/#get-streams
*/
router.get('/games', makeGameRequest);

router.get('/top', makeGameRequest);

module.exports = router;
