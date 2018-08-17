import express from 'express';
import chalk from 'chalk';
import apiMain from './api/apiMain';

require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static('dist'));

app.use((req, res, next) => {
  console.log(
    'Request for ',
    chalk.blue(req._parsedOriginalUrl.pathname),
    chalk.green(req._parsedOriginalUrl.search || '')
  );
  next();
});

// All API routing is handled through apiMain
app.use('/api', apiMain);
app.listen(port, () => console.log(`Listening on port ${port}!`));
