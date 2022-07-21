const axios = require('axios');

const launch = {
    flightNumber: 100,
    mission: 'Kepler Exploration X',
    rocket: 'Explorer IS1',
    launchDate: new Date('December 27, 2030'),
    target: 'Kepler-442 b',
    customers: ['cust1', 'cust2'],
    upcoming: true,
    success: true
};

const DEFAULT_FLIGHT_NUMBER = 100;

const launches = require("./launchesMongo.js");
const planets = require('./planetMongo');


async function getLaunchByFilter(filter){
    return await launches.findOne(filter);
}

async function idExists(launchId) {
    return await getLaunchByFilter({
        flightNumber: launchId
    });
}

async function getAllLaunches(limit, page){
    console.log(limit, page);
    return await launches
    .find({}, {
        '_id': 0, '_v':0
    })
    .sort({flightNumber: 1})
    .skip((page - 1) * limit)
    .limit(limit);
}

async function getLatestFlightNumber(){
    const latestLaunch = await launches
        .findOne({})
        .sort('-flightNumber');

    if(!latestLaunch){
        return DEFAULT_FLIGHT_NUMBER;
    }

    return latestLaunch.flightNumber;
}

async function checkPlanet(launch){
    return await planets.findOne({
        keplerName: launch.target
    });
}

async function saveLaunch(launch){
    const planet = await checkPlanet(launch);
    return await upsertLaunch(planet, launch);
}

async function upsertLaunch(planet, launch){
    if(!planet) {
        throw new Error('No planet found!!');
    }

    return await launches.findOneAndUpdate({
        flightNumber: launch.flightNumber
    }, launch,
    {
        upsert: true
    });
}

async function scheduleNewLaunch(launch) {
    const newFlightNumber = await getLatestFlightNumber() + 1;
    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ["Nass"],
        flightNumber: newFlightNumber,
    });

    return await saveLaunch(newLaunch);
}

async function abortLaunch(launchId){
    const id = parseInt(launchId);
    
    return await launches.updateOne({
        flightNumber: id
    }, 
    {
        upcoming: false,
        success: false
    });
}

const SPACE_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function loadSpaceData() {
    const checkLaunch = await getLaunchByFilter({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat',
    }); 

    if(checkLaunch){
        return;
    }
    else {
        populateSpaceData();
    }
}

async function populateSpaceData(){
    console.log('Launch data ...');
    const response = await axios.post(SPACE_API_URL, {
        "query": {},
        "options": {
            "populate": [
                {
                    "path": "rocket",
                    "select": {
                        "name": 1
                    }
                },
                {
                    "path": "payloads",
                    "select": {
                        "customers": 1
                    }
                }
            ]
        } 
    });

    if (response.status !== 200){
        console.log('Problem downloading launch data');
        throw new Error('Failed to launch data');
    }

    const launchData = response.data.docs;
    for (const doc of launchData){
        const payload = doc['payloads'];
        const customers = payload.flatMap((p) => {
            return p['customers'];
        });

        const launch = {
            flightNumber: doc['flight_number'],
            mission: doc['name'],
            rocket: doc['rocket']['name'],
            launchDate: doc['date_local'],
            target: doc['target'],
            customers: customers,
            upcoming: doc['upcoming'],
            success: doc['success']
        };

        const planet = await checkPlanet(launch);
        if (planet){
            await upsertLaunch(launch);
        }
    }
}


module.exports = {
    getAllLaunches,
    scheduleNewLaunch,
    abortLaunch,
    idExists,
    loadSpaceData
};