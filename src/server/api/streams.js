/* Router for handling Stream API details

*/

import express from 'express';

const router = express.Router();

router.use((req, res, next) => {
  console.log('Stream api!');
  next();
});

router.get('/', (req, res) => {
  res.send('streams home');
});

module.exports = router;
