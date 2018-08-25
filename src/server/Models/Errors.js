/* All of the different errors that're expected to be thrown within the system

*/
function newError({ name, code, message }) {
  const err = new Error(message);
  err.code = code;
  err.name = name;

  return err;
}

module.exports = {
  // Standard errors
  genericError: newError({ code: 500, message: 'Something went wrong' }),
  fileNotFound: newError({ code: 404, message: 'File not found' }),
  badRequest: newError({ code: 400, message: 'Bad request' }),
  unauthorized: newError({ code: 401, message: 'Not authorized to view that' }),
  timeout: newError({ code: 408, message: 'Request took too long' }),
  tooManyRequests: newError({
    code: 429,
    message:
			'Too many requests to Twitch are being made, please try again later'
  }),
  notYetImplemented: newError({
    code: 501,
    message: 'That is not yet implemented'
  }),

  // Unique
  malformedFile: newError({
    name: 'malformedFile',
    message: 'File is malformed'
  }),
  malformedObject: newError({
    name: 'malformedObject',
    message: 'Object is malformed'
  }),

  // Error received from Twitch servers
  twitchError(message) {
    return newError({ name: 'twitch', message });
  }
};
