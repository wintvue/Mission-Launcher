const { getAllLaunches, scheduleNewLaunch, abortLaunch, idExists }  = require('../../models/launchesModel.js');

async function httpGetAllLaunches(req, res){
    const {limit, page} = req.query
    return res.status(200).json(await getAllLaunches(limit, page));
}

async function httpPostLaunch(req, res){
    const launch = req.body;

    if (!launch.mission || !launch.rocket || 
        !launch.launchDate || !launch.target){
            return res.status(400).json({
                error: 'Missing required attributes'
            });
        }

    launch.launchDate = new Date(launch.launchDate);
    if (isNaN(launch.launchDate)){
            return res.status(400).json({
                error: 'Invalid Date'
            });
        }

    await scheduleNewLaunch(launch);
    return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res){
    const exists = await idExists(req.params.id);
    if (!exists){
        return res.status(404).json({
            error: 'Launch not found',
        });
    }
    const abort = await abortLaunch(req.params.id);
    return res.status(201).json(abort);
}

module.exports = {
    httpGetAllLaunches,
    httpPostLaunch,
    httpAbortLaunch
}