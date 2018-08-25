/* The hub for all routers to pass through.
*/
import express from 'express';
import os from 'os';
import chalk from 'chalk';
import games from './games';
import streams from './streams';
import utils from '../../utils';
import Errors from '../Models/Errors';

const router = express.Router();

// Initial middleware; notice that a request was made
router.use((req, res, next) => {
  if (process.env.NODE_ENV == 'dev') {
    console.log(
      'Request for ',
      chalk.blue(req._parsedUrl.pathname),
      chalk.green(req._parsedUrl.search || '')
    );
  }
  next();
});

// Separate router files for Games and Streams
// Note this regex allows case-insensitive, as well as either "game" or "games" to work
router.use(/\/api\/game(s)?/i, games);
router.use(/\/api\/stream(s)?/i, streams);

// Routes for api specifically
router.get('/api/', (req, res) => {
  res.send('api home');
});

router.get('/api/getUsername', (req, res) => {
  res.send({ username: os.userInfo().username });
});

// Error-handling middleware; must be the last router function
router.use((err, req, res, next) => {
  if (process.env.NODE_ENV == 'dev') {
    console.log(chalk.red('Hit error handler: ') + err.name);
    // console.error(err);
  }

  let status = 500;
  let message = err;

  // If the error comes with a specific code, then that makes it a proper HTTP error.
  if (err.code) {
    status = Number(err.code);
    message = err.message;
  }
  if (err.name === 'twitch') {
    status = 400;
    message = 'Error retrieving data from Twitch';
  } else if (err === Errors.fileNotFound) {
    status = 404;
  }

  res.status(status);
  res.send(`Error: ${message}`);
});

module.exports = router;
