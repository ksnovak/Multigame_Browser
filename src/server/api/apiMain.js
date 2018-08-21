/* The hub for all routers to pass through.
*/
import express from 'express';
import os from 'os';
import streams from './streams';
import games from './gamesAPI';

const router = express.Router();
router.use((req, res, next) => {
  next();
});

// Separate router files for Games and Streams
// Note this regex allows case-insensitive, as well as either "game" or "games" to work
router.use(/\/game(s)?/i, games);
router.use(/\/stream(s)?/i, streams);

// Routes for api specifically
router.get('/', (req, res) => {
  res.send('api home');
});

router.get('/getUsername', (req, res) => {
  res.send({ username: os.userInfo().username });
});

module.exports = router;
