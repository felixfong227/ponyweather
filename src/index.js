const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const fs = require('fs');
const path = require('path');
let timezonedbtoken;
let githubtoken;
let oAuthJSON = {};
let usingENV;
app.enable('trust proxy');
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

// Check the auth toekn

if(process.env.GITHUB && process.env.WORLDTIMEIO) {
    usingENV = true;
}else{
    usingENV = false;
}

if(!usingENV) {
    if(!fs.existsSync(path.join(`${__dirname}/../oauthTokens/token.json`))) {
        console.log('Please set up some kind of oAuth tokens');
        process.exit();
    }else{
        const fPath = path.join(`${__dirname}/../oauthTokens/token.json`);
        oAuthJSON = JSON.parse(fs.readFileSync(fPath, 'utf-8'));
    }
}

module.exports.githubtoken = process.env.GITHUB;
module.exports.worldtimeiotoekn = process.env.WORLDTIMEIO;
module.exports.googlekey = process.env.GOOGLE_KEY;

app.set('view engine', 'ejs');

app.get('/favicon.ico', (req, res) => {
    res.end('lol');
});

app.use('/static', express.static(path.join(`${__dirname}/../static`)));

app.use('/image', require('./image'));

app.use('/api', require('./api'));

app.use('/', require('./webview'));
