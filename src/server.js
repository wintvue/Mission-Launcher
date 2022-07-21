require('dotenv').config();

const http = require('http');
const mongoose = require('mongoose');

const { loadData } = require('./models/planetModel.js');
const { loadSpaceData } = require('./models/launchesModel');

const PORT = process.env.PORT || 8000;

const app = require('./app.js');

const MONGO_URL = process.env.MONGO_URL;

const server = http.createServer(app);

mongoose.connection.once('open', () => {
    console.log('MongoDB connection ready!')
});

mongoose.connection.on('error', (err) => {
    console.log(err)
});

async function startServer(){
    await mongoose.connect(MONGO_URL);

    await loadData();

    await loadSpaceData();

    server.listen(PORT, () => {
        console.log(`Listening on port ${PORT}...`)
    });
}

startServer();



