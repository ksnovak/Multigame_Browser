import request from 'request';
import axios from 'axios';
import Errors from '../Models/Errors';
import fs from 'fs';
import utils from '../../utils'

require('dotenv').config();

module.exports = {
  baseRequest: axios.create({
    baseURL: 'https://api.twitch.tv',
    headers: {
      'Client-ID': process.env.TWITCH_CLIENT_ID
    }
  }),

  // Get the Bearer token from Twitch; this allows for a greater rate limit
  async generateBearerToken() {

    utils.devLog('Generating new Bearer token');

    const results = await this.makeTwitchRequest({
      verb: 'post',
      uri: `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`
    });

    this.updateBearerToken(results.data);
  },

  async makeTwitchRequest({ verb, uri, headers, params }) {

    utils.devLog('Calling Twitch at ' + utils.devChalk('blue', uri) + ' with ' + utils.devChalk('yellow', JSON.stringify(params)))

    try {
      return await this.baseRequest({
        method: verb || 'get',
        url: uri,
        headers,
        params
      })
    } catch (err) {
      throw err
    }
  },

  async commonTwitchRequest({ uri, qs, onResponse, rejectErrors, next }) {
    // Get a bearer token if we don't have one; this allows 120 requests instead of 30 from Twitch
    if (this.isNewBearerTokenNeeded()) {
      await this.generateBearerToken();
    }

    // Check if we have exceeded our API rate limit. If so, immediately reject; otherwise, continue the request
    if (this.isRateLimitExceeded()) {
      let err = Errors.tooManyRequests
      if (rejectErrors && next)
        next(err);
      else if (onResponse)
        onResponse(err);
      else
        return err;

    }
    else {
      try {
        let results = await this.makeTwitchRequest({
          verb: 'get',
          uri,
          headers: { Authorization: `Bearer ${this.bearerToken.access_token}` },
          params: qs
        })

        //If a callback function was provided, call it
        if (onResponse)
          onResponse(null, results, results.data);

        //Otherwise, just return with the data
        return results.data;

      } catch (err) {
        //If the flag to automatically reject errors was passed, then do so.
        if (rejectErrors && next) {
          if (err.response) //If this was an error from Twitch
            next(Errors.twitchError({ code: err.response.status, message: err.response.statusText }));
          else
            next(Errors.genericError);
        }
        //Otherwise, send the error back to be handled by the caller.
        else {
          if (onResponse)
            onResponse(err)

          return err;
        }
      }
    }
  },

  bearerToken: {
    access_token: null,
    expires_at: null,
    token_type: null
  },

  updateBearerToken({ access_token, expires_at, expires_in, token_type }) {
    // Find out when the access token expires; The "expires_in" value from Twitch is a number of seconds from now, which is tougher to handle
    // Figure out the time at which it expires, instead, and save that.
    const expiration_time = expires_at ? expires_at : (Date.now() + expires_in * 1000);

    if (process.env.NODE_ENV === 'dev') {
      const daysTillExpire = parseInt(expires_in / 60 / 60 / 24);
      utils.devLog(`Bearer expires ${daysTillExpire ? `in ~${daysTillExpire} days, ` : ''}at: ${new Date(expiration_time).toLocaleString()}`);
    }

    this.bearerToken.access_token = access_token;
    this.bearerToken.expires_at = expiration_time;
    this.bearerToken.token_type = token_type;

    this.writeBearerTokenInFile();
  },


  //We try to save bearer tokens in file, so look for it and parse it into an object if possible
  readBearerTokenFromFile() {
    try {
      const results = JSON.parse(fs.readFileSync('bearerToken').toString());
      return results;
    }
    catch (err) {
      return null
    }
  },

  //Save the bearer token as a file, since we need it to persist through restarts and updates
  writeBearerTokenInFile() {
    fs.writeFileSync('bearerToken', JSON.stringify(this.bearerToken))
  },

  // Check if we need a new bearer token
  isNewBearerTokenNeeded() {
    const tokenFromFile = this.readBearerTokenFromFile();

    //If we don't have one in memory, try getting one from a file.
    if (this.bearerToken.access_token == null) {
      if (tokenFromFile != null) {
        this.updateBearerToken(tokenFromFile);
      }
    }
    else if (tokenFromFile == null) {
      this.writeBearerTokenInFile();
    }

    // If the token isn't set, or if we've gone past the expire time, then we need to get a new token.
    return (this.bearerToken.access_token == null || Date.now() > this.bearerToken.expires_at);
  },

  // Twitch's API rate limits say how many more requests we can make, we have to keep track of it in order to avoid unexpected errors
  rateLimit: {
    limit: null,
    remaining: null,
    reset: null
  },

  updateRateLimit(headers) {
    this.rateLimit.limit = Number(headers['ratelimit-limit']);
    this.rateLimit.remaining = Number(headers['ratelimit-remaining']);
    this.rateLimit.reset = Number(headers['ratelimit-reset']);
  },

  // See if we have exceeded Twitch's API limit. This is a really rough guess.
  // If we have rateLimit details set, and it says we have no Remaining requests, and that there is still time until the Reset, then we consider it exceeded
  isRateLimitExceeded() {
    const timeTillReset = this.rateLimit.reset - parseInt(Date.now() / 1000);
    if (
      this.rateLimit.remaining != null
      && this.rateLimit.remaining < 1
      && this.rateLimit.reset != null
      && timeTillReset > 1
    ) {
      return true;
    }

    return false;
  }
};
