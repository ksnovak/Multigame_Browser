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

function streamsFromData(body) {
  try {
    const parsedBody = JSON.parse(body);

    if (parsedBody.error) throw parsedBody.error;

    return parsedBody.data.map(stream => new Stream(stream));
  } catch (ex) {
    throw ex;
  }
}

function commonRequest({
  uri, qs, onResponse, rejectErrors, next
}) {
  baseRequest.get({ uri, qs }, (error, response, body) => {
    if (!error && body) {
      error = JSON.parse(body).error;
    }

    // If an error occurs, and the flag is set to automatically reject errors, then do so:
    if (rejectErrors && next && error) {
      if (error) {
        next(error);
      } else {
        const parsed = JSON.parse(body);
        if (parsed.error) {
          next(parsed.error);
        }
      }
    } else {
      // Otherwise, return everything to the caller:
      onResponse(error, response, body);
    }
  });
}

/* Get details for specified users (Note: This even gets details on offline users)
    Querystring params: id, login
    https://dev.twitch.tv/docs/api/reference/#get-users
*/
router.get('/details', (req, res, next) => {
  commonRequest({
    uri: '/helix/users',
    qs: QueryOptions.getValidQueryOptions('/streams/details', req.query),
    rejectErrors: true,
    next,
    onResponse: (error, response, body) => {
      try {
        res.send(streamsFromData(body));
      } catch (err) {
        next(err);
      }
    }
  });
});

/* Get list of live streams for specified games
    Querystring params: game_id, language, first
    WARNING: You can specify either the game, or the streamer. If you do both, it returns an inner join basically (all of the specified people, streaming the specified games)
    https://dev.twitch.tv/docs/api/reference/#get-streams
*/
router.get('/games', (req, res, next) => {
  const options = QueryOptions.getValidQueryOptions(
    '/streams/games',
    req.query
  );

  // Make sure that a game or user was specified. If not, return early with nothing.
  if (!(options.game_id || options.user_id || options.user_login)) {
    res.send([]);
  } else {
    commonRequest({
      uri: '/helix/streams',
      qs: options,
      rejectErrors: true,
      next,
      onResponse: (error, response, body) => {
        try {
          res.send(streamsFromData(body));
        } catch (err) {
          next(err);
        }
      }
    });
  }
});

router.get('/top', (req, res, next) => {
  commonRequest({
    uri: '/helix/streams',
    qs: QueryOptions.getValidQueryOptions('/streams/top', req.query),
    rejectErrors: true,
    next,
    onResponse: (error, response, body) => {
      try {
        res.send(streamsFromData(body));
      } catch (err) {
        next(err);
      }
    }
  });
});

module.exports = router;
