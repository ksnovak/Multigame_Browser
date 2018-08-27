import express from 'express';
import Stream from '../Models/Stream';
import QueryOptions from '../Models/QueryOptions';
import RoutesUtils from './routeUtils';

const router = express.Router();

function streamsFromData(body) {
  try {
    if (body.error) throw body.error;

    return body.data.map(stream => new Stream(stream));
  } catch (ex) {
    throw ex;
  }
}

async function getStreamsForGame(options, next) {
  const results = await RoutesUtils.commonTwitchRequest({ uri: '/helix/streams', qs: options, rejectErrors: true, next });

  return streamsFromData(results);
}

/* Get list of live streams for specified games
    Querystring params: game_id, language, first
    WARNING: You can specify either the game, or the streamer. If you do both, it returns an inner join basically (all of the specified people, streaming the specified games)
    https://dev.twitch.tv/docs/api/reference/#get-streams
*/
router.get('/games', async (req, res, next) => {
  const options = QueryOptions.getValidQueryOptions(
    '/streams/games',
    req.query
  );

  // Make sure that a game or user was specified. If not, return early with nothing.
  if (!(options.game_id || options.user_id || options.user_login)) {
    res.send([]);
  } else {
    try {
      const results = await getStreamsForGame(options, next);
      res.send(results);
    }
    catch (err) {
      next(err);
    }
  }
});

router.get('/top', (req, res, next) => {
  RoutesUtils.commonTwitchRequest({
    uri: '/helix/streams',
    qs: QueryOptions.getValidQueryOptions('/streams/top', req.query),
    rejectErrors: true,
    next,
    onResponse: (error, response, jsonData) => {
      try {
        res.send(streamsFromData(jsonData));
      } catch (err) {
        next(err);
      }
    }
  });
});

module.exports = router;
