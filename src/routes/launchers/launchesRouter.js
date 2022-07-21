const express = require('express');

const { launches } = require('../../models/launchesModel.js');

const { httpGetAllLaunches, httpPostLaunch, httpAbortLaunch} = require('./launchesController.js')

const launchesRouter = express.Router();

launchesRouter.get('/', httpGetAllLaunches);

launchesRouter.post('/postLaunch', httpPostLaunch);

launchesRouter.delete('/:id', httpAbortLaunch);

module.exports = launchesRouter;