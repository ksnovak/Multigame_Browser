import express from 'express';
import Stream from '../Models/Stream';
import QueryOptions from '../Models/QueryOptions';
import RoutesUtils from './routeUtils';
import utils from '../../utils';

const router = express.Router();

// Get an array of streams, from the raw Twitch data
function streamsFromData(body, exclude) {
  try {
    if (body.error) throw body.error;

    const streamsArray = [];

    // Go through each of the raw streams
    body.data.forEach((stream) => {
      const streamObj = new Stream(stream);

      // Make sure that the stream isn't part of our Exclude list, and isn't already in the array
      if (
        !utils.isInExclude(streamObj.login, exclude)
        && !utils.isAlreadyInArray(streamObj, 'user_id', streamsArray)
      ) {
        streamsArray.push(streamObj);
      }
    });

    return streamsArray;
  }
  catch (ex) {
    throw ex;
  }
}

async function getStreams(params, next) {
  const options = QueryOptions.cleanIncomingQueryOptions('/streams/list', params);

  // Make sure that a game or user was specified. If not, return early with nothing.
  if (!(options.game_id || options.stream_id || options.name)) {
    return [];
  }

  // Twitch's API requires you to ask for either game ID(s) xor user detail(s). Doing both acts like an inner join, which is what we don't want.
  // In this case, if the user wants both types, we'll make two calls and combine the results:
  if (options.game_id && (options.stream_id || options.name)) {
    const gameOnlyOptions = Object.assign({}, options);
    gameOnlyOptions.stream_id = undefined;
    gameOnlyOptions.name = undefined;

    const userOnlyOptions = Object.assign({}, options);
    userOnlyOptions.game_id = undefined;

    const [userStreams, gameStreams] = [
      await getStreams(userOnlyOptions, next),
      await getStreams(gameOnlyOptions, next)
    ];

    return utils.combineArraysWithoutDuplicates(userStreams, gameStreams, 'user_id');
  }
  // If the user only requested one of the types, make a simpler request:
  if (options.game_id || options.stream_id || options.name) {
    const results = await RoutesUtils.commonTwitchRequest({
      uri: '/helix/streams',
      options,
      rejectErrors: true,
      next
    });

    return streamsFromData(results, options.exclude);
  }

  // If none was requested, skip making a request entirely.
  return [];
}

async function getTopStreams(params, next) {
  const options = QueryOptions.cleanIncomingQueryOptions('/streams/top', params);

  if (options.include_top_streams === false) {
    return [];
  }

  const results = await RoutesUtils.commonTwitchRequest({
    uri: '/helix/streams',
    options,
    rejectErrors: true,
    next
  });

  return streamsFromData(results, options.exclude);
}

async function getTopAndSpecificStreams(params, next) {
  const [specificResult, topResult] = [
    await getStreams(params, next),
    await getTopStreams(params, next)
  ];
  return utils.combineArraysWithoutDuplicates(specificResult, topResult, 'user_id');
}

/* Get list of live streams, for either the specified game or specified users
    WARNING: You can specify either the game, or the streamer. If you do both, it returns an inner join basically (all of the specified people, streaming the specified games)
    https://dev.twitch.tv/docs/api/reference/#get-streams
*/
router.get('/list', async (req, res, next) => {
  try {
    const results = await getStreams(req.query, next);
    res.send(results);
  }
  catch (err) {
    next(err);
  }
});

router.get('/top', async (req, res, next) => {
  try {
    const results = await getTopStreams(req.query, next);
    res.send(results);
  }
  catch (err) {
    next(err);
  }
});

module.exports = {
  router,
  getStreams,
  getTopStreams,
  getTopAndSpecificStreams
};
