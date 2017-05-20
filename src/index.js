const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const request = require('request');
const fs = require('fs');
const path = require('path');
const getIP = require('ipware')().get_ip;
let timezonedbtoken;
let githubtoken;

let usingENV;
app.enable('trust proxy');
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

// Check the auth toekn

if(process.env.GITHUB && process.env.TIMEZONEDB){
    usingENV = true;
}else{
    usingENV = false;
}

if(!usingENV) {
    if(!fs.existsSync(path.join(`${__dirname}/../oauthTokens/token.json`))) {
        console.log('Please set up some kind of oAuth tokens');
        process.exit();
    }else{
        const oAuthJSON = JSON.parse(fs.readFileSync(path.join(`${__dirname}/../oauthTokens/token.json`), 'utf-8'));
    }
}

// Settings up the github
if(process.env.GITHUB) {
    githubtoken = process.env.GITHUB;
}else{
    githubtoken = oAuthJSON.github;
}

// Settings up the timezonedb
if(process.env.GITHUB) {
    timezonedbtoken = process.env.TIMEZONEDB;
}else{
    timezonedbtoken = oAuthJSON.timezonedb;
}

console.log(`Timezonedb token: ${timezonedbtoken}`);
module.exports.timezonedbtoken = timezonedbtoken;

console.log(`GitHub token: ${githubtoken}`);
module.exports.githubtoken = githubtoken;

app.set('view engine', 'ejs');

app.get('/favicon.ico', (req, res) => {
    res.end('lol');
});

app.use('/static', express.static(path.join(`${__dirname}/../static`)));

app.use('/image', require('./image'));

app.use('/api', require('./api'));

app.use('/', require('./webview'));
