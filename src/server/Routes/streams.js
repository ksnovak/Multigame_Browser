import express from 'express';
import Stream from '../Models/Stream';
import QueryOptions from '../Models/QueryOptions';
import RoutesUtils from './routeUtils';
import utils from '../../utils'

const router = express.Router();

function streamsFromData(body) {
  try {
    if (body.error) throw body.error;

    let streamsArray = body.data.map(stream => new Stream(stream));
    return utils.removeArrayDuplicates(streamsArray, 'user_id')
  } catch (ex) {
    throw ex;
  }
}

async function getStreams(options, next) {
  //Twitch's API requires you to ask for either game ID(s) xor user detail(s). Doing both acts like an inner join, which is what we don't want.
  //In this case, if the user wants both types, we'll make two calls and combine the results:
  if (options.game_id && (options.user_id || options.user_login)) {
    let gameOnlyOptions = Object.assign({}, options)
    gameOnlyOptions.user_id = undefined;
    gameOnlyOptions.user_login = undefined;

    let userOnlyOptions = Object.assign({}, options)
    userOnlyOptions.game_id = undefined;

    const [userStreams, gameStreams] = [await getStreams(userOnlyOptions, next), await getStreams(gameOnlyOptions, next)]

    return utils.combineArraysWithoutDuplicates(userStreams, gameStreams, 'user_id');
  }
  //If the user only requested one of the types, make a simpler request:
  else {
    const results = await RoutesUtils.commonTwitchRequest({ uri: '/helix/streams', qs: options, rejectErrors: true, next });

    return streamsFromData(results);
  }
}

/* Get list of live streams, for either the specified game or specified users
    WARNING: You can specify either the game, or the streamer. If you do both, it returns an inner join basically (all of the specified people, streaming the specified games)
    https://dev.twitch.tv/docs/api/reference/#get-streams
*/
router.get('/list', async (req, res, next) => {
  const options = QueryOptions.getValidQueryOptions(
    '/streams/list',
    req.query
  );

  // Make sure that a game or user was specified. If not, return early with nothing.
  if (!(options.game_id || options.user_id || options.user_login)) {
    res.send([]);
  } else {
    try {
      const results = await getStreams(options, next);
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

module.exports = {
  router,
  getStreams
};
