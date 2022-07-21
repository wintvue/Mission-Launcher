const express = require('express');

const planetsRouter = require('./planets/planetRouter.js');
const launchesRouter = require('./launchers/launchesRouter.js');

const api = express.Router();

api.use('/planets', planetsRouter);
api.use('/launches', launchesRouter);

module.exports = api;