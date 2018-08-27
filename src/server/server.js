import express from 'express';
import chalk from 'chalk';
import routes from './Routes/routesMain';
import moment from 'moment'

require('dotenv').config();

const app = express();

const port = process.env.PORT || 8081;
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

app.use(express.static('dist'));

// All routing is handled through routesMain
app.use(routes);

if (!module.parent) app.listen(port, () => console.log(`Listening on port ${chalk.blue(port)}, at ${chalk.blue(moment().format('hh:mm:ss a (dddd)'))}`));

module.exports = { app };
