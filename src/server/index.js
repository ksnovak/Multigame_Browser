const express = require('express');
const os = require('os');
require('dotenv').config();

const app = express();

const port = process.env.PORT || 8080;

app.use(express.static('dist'));
app.get('/api/getUsername', (req, res) => res.send({ username: os.userInfo().username }));
app.listen(port, () => console.log(`Listening on port ${port}!`));
