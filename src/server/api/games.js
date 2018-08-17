/* Router for handling Game API details

*/

import express from 'express';

const router = express.Router();

router.use((req, res, next) => {
  console.log('Games api!');
  next();
});

router.get('/', (req, res) => {
  res.send('games home');
});

module.exports = router;
