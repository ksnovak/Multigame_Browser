import request from 'request';
import axios from 'axios';
import Errors from '../Models/Errors';

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
    if (process.env.NODE_ENV === 'dev') {
      console.log('Generating new Bearer token');
    }
    const results = await axios.post(
      `https://id.twitch.tv/oauth2/token?client_id=${
        process.env.TWITCH_CLIENT_ID
      }&client_secret=${
        process.env.TWITCH_CLIENT_SECRET
      }&grant_type=client_credentials`
    );

    this.updateBearerToken(results.data);
  },

  async commonTwitchRequest({
    uri, qs, onResponse, rejectErrors, next
  }) {
    // Get a bearer token if we don't have one; this allows 120 requests instead of 30 from Twitch
    if (this.isNewBearerTokenNeeded()) {
      await this.generateBearerToken();
    }

    // Check if we have exceeded our API rate limit. If so, immediately reject; otherwise, continue the request
    if (this.isRateLimitExceeded()) {
      next(Errors.tooManyRequests);
    } else {
      this.baseRequest
        .get(uri, {
          headers: { Authorization: `Bearer ${this.bearerToken.access_token}` },
          params: qs
        })
        .then((response) => {
          // Before anything else, update the rate limit details
          this.updateRateLimit(response.headers);

          onResponse(null, response, response.data);
        })
        .catch((error) => {
          // If an error occurs, and the flag is set to automatically reject errors, then do so:
          if (rejectErrors && next) {
            next(
              Errors.twitchError({
                code: error.response.status,
                message: error.response.statusText
              })
            );
          }
          // Otherwise, just hit the callback with the error object
          else {
            onResponse(error);
          }
        });
    }
  },

  bearerToken: {
    access_token: null,
    expires_at: null,
    token_type: null
  },

  updateBearerToken({ access_token, expires_in, token_type }) {
    // Find out when the access token expires; The "expires_in" value from Twitch is a number of seconds from now, which is tougher to handle
    // Figure out the time at which it expires, instead, and save that.
    const expiration_time = Date.now() + expires_in * 1000;

    if (process.env.NODE_ENV === 'dev') {
      const daysTillExpire = parseInt(expires_in / 60 / 60 / 24);
      console.log(
        `New Bearer expires in ~${daysTillExpire} days, at: ${new Date(
          expiration_time
        ).toGMTString()}`
      );
    }

    this.bearerToken.access_token = access_token;
    this.bearerToken.expires_at = expiration_time;
    this.bearerToken.token_type = token_type;
  },

  // Check if we need a new bearer token
  isNewBearerTokenNeeded() {
    // If the token isn't set, or if we've gone past the expire time, then we need to get a new token.
    return (
      this.bearerToken.access_token == null
			|| Date.now() > this.bearerToken.expires_at
    );
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
