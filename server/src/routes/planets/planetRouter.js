const express = require('express'); 

const planetController = require('./planetController.js');

const {
    httpGetAllPlanets
} = planetController;

const planetsRouter = express.Router();

planetsRouter.get('/', httpGetAllPlanets);

module.exports = planetsRouter;