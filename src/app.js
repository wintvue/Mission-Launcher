require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');

const planetsRouter = require('./routes/planets/planetRouter.js');
const launchesRouter = require('./routes/launchers/launchesRouter.js');
const api = require('./routes/api.js');
const app = express();

// app.use(cors());
// var corsOptions = {
//     origin: 'http://localhost:8000/',
//     optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
//   }

var corsOptions = {
    origin: process.env.CORS_URL
  };

app.use(cors(corsOptions));
app.use(morgan('combined'));

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));


app.use('/v1', api);

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen();

module.exports = app;
