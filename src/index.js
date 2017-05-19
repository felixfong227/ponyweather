const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const request = require('request');
const fs = require('fs');
const path = require('path');
const getIP = require('ipware')().get_ip;
let timezonedbtoken;
app.enable('trust proxy');
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

// Check the auth toekn
if(!fs.existsSync(path.join(`${__dirname}/../oauthTokens/token.json`))){
    // No JSON file
    // Try the env variable
    if(!process.env.TIMEZONEDB){
        console.log('ERROR!!');
        console.error('Please set up the Timezonedb auth token');
        process.exit();
    }else{
        console.log('Using the env variable');
    }
}else{
    console.log('Using timezonedb.json');
}

if(!fs.existsSync(path.join(`${__dirname}/../oauthTokens/token.json`))){
    // No JSON file
    // Try the env variable
    if(!process.env.TIMEZONEDB){
        console.log('ERROR!!');
        console.error('Please set up the Timezonedb auth token');
        process.exit();
    }else{
        timezonedbtoken = process.env.TIMEZONEDB;
    }

    if(!process.env.TIMEZONEDB){
        console.log('ERROR!!');
        console.error('Please set up the Openweathermap auth token');
        process.exit();
    }else{
        openweathertoken = process.env.OPENWEATHERMAP
    }

}else{
    timezonedbtoken = JSON.parse(fs.readFileSync(path.join(`${__dirname}/../oauthTokens/token.json`), 'utf-8'))['timezonedb'];
}
console.log(`Timezonedb token: ${timezonedbtoken}`);
module.exports.timezonedbtoken = timezonedbtoken;

app.set('view engine', 'ejs');

app.get('/favicon.ico', (req, res) => {
    res.end('lol');
});

app.use('/static', express.static(path.join(`${__dirname}/../static`)));

app.use('/image', require('./image'));

app.use('/api', require('./api'));

app.use('/', require('./webview'));