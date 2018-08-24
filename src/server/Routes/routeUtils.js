import request from 'request';
import Errors from '../Models/Errors';

require('dotenv').config();

module.exports = {
  baseRequest: request.defaults({
    headers: {
      'Client-ID': process.env.TWITCH_CLIENT_ID,
      Authorization: `Bearer ${process.env.TWITCH_CLIENT_SECRET}`
    },
    baseUrl: 'https://api.twitch.tv'
  }),

  commonTwitchRequest({
    uri, qs, onResponse, rejectErrors, next
  }) {
    this.baseRequest.get({ uri, qs }, (error, response, body) => {
      const jsonData = JSON.parse(body);

      // If an error occurs, and the flag is set to automatically reject errors, then do so:
      if (rejectErrors && next && (error || (jsonData && jsonData.error))) {
        if (error) {
          next(error);
        } else if (jsonData.error) {
          next(
            Errors.twitchError({
              code: jsonData.error.status,
              message: jsonData.error.message
            })
          );
        }
      } else {
        // Otherwise, return everything to the caller:
        onResponse(error, response, jsonData);
      }
    });
  }
};
