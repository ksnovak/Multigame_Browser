import express from 'express';
import routes from './Routes/routesMain';

require('dotenv').config();

const app = express();

const port = process.env.PORT || 8081;

app.use(express.static('dist'));

// All routing is handled through routesMain
app.use(routes);

if (!module.parent) app.listen(port, () => console.log(`Listening on port ${port}!`));
