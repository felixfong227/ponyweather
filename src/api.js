const express = require('express');
const router = express.Router();
const request = require('request');
const fs = require('fs');
const path = require('path');
const timezonedbtoken = require('./index').timezonedbtoken;
let autoIPLookUp = false;
let responseObject = {};

let lat;
let lng;

let dateStatus;
const rp = require('request-promise');
router.get('/:place?', (req, res) => {
    const rootURL = req.protocol + '://' + req.get('host');
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
    const type = req.query.type;
    let ipinfourl;
    const supportingTypes = [
        'json',
        'xml',
    ];
    res.setHeader('Content-Type', 'application/json');
    // Get the current user ip address
    const iplocation = require('iplocation');
    const publicIp = require('public-ip');
    // Get the user location data
    const weather = require('weather-js');
    let place;
    let clientPlace;
    if( typeof req.params.place == 'undefined' && clientIP !== '::1'){
        ipinfourl = `http://ipinfo.io/${clientIP}`;
        autoIPLookUp = true;
    }else{
        ipinfourl = 'http://ipinfo.io';
        autoIPLookUp = false;
    }

    rp.get(ipinfourl)
    .then(response => {
        response = JSON.parse(response);
        place = response.region;
        if(typeof req.params.place !== 'undefined') {
            clientPlace = req.params.place;
        }else{
            clientPlace = place;
        }
        // Fetch the Google Maps API fot the lat and lng
        // Tips, Using the V3 you can fetch data without an API key, thanks Google :P]
        return rp.get(`https://maps.google.com/maps/api/geocode/json?address=${clientPlace}`);
    })
    .then(response => {
        response = JSON.parse(response)
        response = response.results[0];
        lat = response.geometry.location.lat;
        lng = response.geometry.location.lng;
        responseObject['location'] = response.formatted_address;
        // Fetch the woeid
        return rp.get(`https://www.metaweather.com/api/location/search/?query=${place}`)
        // return rp.get(`http://api.timezonedb.com/v2/get-time-zone?key=${timezonedbtoken}&by=position&lat=${lat}&lng=${lng}&format=json`);
    })
    .then(response => {
        response = JSON.parse(response);
        // Get the first one
        const woeid = response[0].woeid;
        // Fetch the weather data
        return rp.get(`https://www.metaweather.com/api/location/${woeid}`)
    })
    .then(response => {
        response = JSON.parse(response);
        const weatherData = response.consolidated_weather[0];
        responseObject['weather'] = weatherData;
        // Fetch the date and time
        return rp.get(`http://api.timezonedb.com/v2/get-time-zone?key=${timezonedbtoken}&by=position&lat=${lat}&lng=${lng}&format=json`);
    })
    .then(response => {
        response = JSON.parse(response);
        const curDate = new Date(response.formatted);
        const curHr = curDate.getHours();
        if(curHr <= 6 || curHr >= 19) {
            dateStatus = 'night';
        }else if(curHr <= 18){
            dateStatus = 'morning';
        }else {
            dateStatus = 'afternoon';
        }
        responseObject['date'] = {
            day: dateStatus,
            date: {
                date: curDate.getDate(),
                month: curDate.getMonth(),
                year: curDate.getFullYear(),
                hour: curDate.getHours(),
                minuts: curDate.getMinutes(),
                second: curDate.getSeconds(),
            },
        };
        responseObject['date']['formatted'] = response.formatted;
        responseObject['auto_ip_look_up'] = autoIPLookUp;
        let weatherText = responseObject.weather.weather_state_name.replace(/ /igm, '_').toLowerCase();
        // Get the image source
        responseObject['image'] = {
            weather: `${rootURL}/image/${weatherText}?type=weather`,
            background: `${rootURL}/image/${dateStatus}?type=background`,
        };

        // Response to the HTTP request

        // Check the response data set
        if(typeof type == 'undefined' || type == 'json') {
            res.set('Content-Type', 'application/json');
            res.end(JSON.stringify(responseObject));
        }else if(type == 'xml'){
            const js2xmlparser = require("js2xmlparser");
            res.set('Content-Type', 'text/xml');
            res.end(js2xmlparser.parse("result", responseObject));
        }
        else{
            res.end(JSON.stringify(responseObject));
        }
    })
    .catch(error => {
        console.log(error);
    });
});

module.exports = router;
