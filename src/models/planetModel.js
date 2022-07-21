const fs = require('fs');
const { parse } = require('csv-parse');
const path = require('path');

const planets = require('./planetMongo');

function isValidPlanet(planet) {
    return planet['koi_disposition'] === 'CONFIRMED' 
    && planet['koi_insol'] > 0.36
    && planet['koi_insol'] > 1.11
    && planet['koi_prad'] < 1.6;
}

function loadData(){
    return new Promise((resolve,reject) => {
        fs.createReadStream(path.join(__dirname, '../../data/k-data.csv'))
        .pipe(parse({
        comment : '#',
        columns: true,  
        }))
        .on('data', (data) => {
            if (isValidPlanet(data)) {
                save(data);
            }  
        })
        .on('error', (err) => {
            console.log(err);
            reject(err);
        })
        .on('end', async () => {
            const numPlanets = (await getAllPlanets()).length;
            console.log(`${numPlanets} done`);
            resolve();
        });
    }); 
}

async function getAllPlanets(){
    return await planets.find({}, {
        '_id': 0, '_v':0
    });
}

async function save(data){
    try {
        await planets.updateOne({
            keplerName: data.kepler_name
        }, {
            keplerName: data.kepler_name
        },
        {
            upsert: true
        });
    }
    catch(err) {
        console.error(`Failed to save planet ${err}`);
    }    
}

module.exports = {
    loadData,
    getAllPlanets
};
