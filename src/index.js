const expess = require('express');
const app = expess();
const port = 8080 | process.env.PORT;
const request = require('request');
const fs = require('fs');
const path = require('path');
const getIP = require('ipware')().get_ip;
let timezonedbtoken;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

// Check the auth toekn
if(!fs.existsSync(path.join(`${__dirname}/../oauthTokens/timezonedb.json`))){
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

if(!fs.existsSync(path.join(`${__dirname}/../oauthTokens/timezonedb.json`))){
    // No JSON file
    // Try the env variable
    if(!process.env.TIMEZONEDB){
        console.log('ERROR!!');
        console.error('Please set up the Timezonedb auth token');
        process.exit();
    }else{
        timezonedbtoken = process.env.TIMEZONEDB;
    }
}else{
    timezonedbtoken = JSON.parse(fs.readFileSync(path.join(`${__dirname}/../oauthTokens/timezonedb.json`), 'utf-8'))['token'];
}
console.log(`Timezonedb token: ${timezonedbtoken}`);
module.exports.timezonedbtoken = timezonedbtoken;

app.set('view engine', 'ejs');

app.use('/', require('./webview'));

// GET
app.use('/api', require('./api'));