/* All of the different errors that're expected to be thrown within the system

*/
function newError(name, message) {
  const err = new Error(message);
  err.name = name;

  return err;
}

module.exports = {
  // Standard errors
  genericError: newError(500, 'Something went wrong'),
  fileNotFound: newError(404, 'File not found'),
  badRequest: newError(400, 'Bad request'),
  unauthorized: newError(401, 'Not authorized to view that'),
  timeout: newError(408, 'Request took too long'),
  notYetImplemented: newError(501, 'That is not yet implemented``'),

  // Unique
  malformedFile: newError('malformedFile', 'File is malformed'),
  malformedObject: newError('malformedObject', 'Object is malformed'),

  // Error received from Twitch servers
  twitchError(message) {
    return newError('twitch', message);
  }
};
