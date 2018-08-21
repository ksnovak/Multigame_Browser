/* All of the different errors that're expected to be thrown within the system

*/
function newError(name, message) {
  const err = new Error(message);
  err.name = name;

  return err;
}

module.exports = {
  genericError: newError('generic', 'Something went wrong'),
  fileNotFound: newError(404, 'File not found'),
  malformedFile: newError('malformedFile', 'File is malformed'),
  malformedObject: newError('malformedObject', 'Object is malformed')
};
