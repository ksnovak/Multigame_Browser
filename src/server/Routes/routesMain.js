/* The hub for all routers to pass through.
*/
import express from 'express';
import os from 'os';
import chalk from 'chalk';
import games from './games';
// import streams from './streams';

const router = express.Router();

// Initial middleware; notice that a request was made
router.use((req, res, next) => {
  console.log(
    'Request for ',
    chalk.blue(req._parsedUrl.pathname),
    chalk.green(req._parsedUrl.search || '')
  );
  next();
});

// Separate router files for Games and Streams
// Note this regex allows case-insensitive, as well as either "game" or "games" to work
router.use(/\/api\/game(s)?/i, games);
// router.use(/\/api\/stream(s)?/i, streams);

// Routes for api specifically
router.get('/api/', (req, res) => {
  res.send('api home');
});

router.get('/api/getUsername', (req, res) => {
  res.send({ username: os.userInfo().username });
});

// Error-handling middleware; must be the last router function
router.use((err, req, res, next) => {
  console.log(chalk.red('Hit error handler'), err);
  res.status(500);
  res.send(`Error: ${err}`);
});

module.exports = router;
