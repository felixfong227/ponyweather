const express = require('express');
const router = express.Router();
const request = require('request');
const fs = require('fs');
const path = require('path');
const timezonedbtoken = require('./index').timezonedbtoken;
let autoIPLookUp = false;
router.get('/:place?', (req, res) => {
    const rootURL = req.protocol + '://' + req.get('host');
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
    let ipinfourl;
    res.setHeader('Content-Type', 'application/json');
    // Get the current user ip address
    const iplocation = require('iplocation');
    const publicIp = require('public-ip');
    // Get the user location data
    const weather = require('weather-js');
    let place;
    if( typeof req.params.place == 'undefined' && clientIP !== '::1'){
        ipinfourl = `http://ipinfo.io/${clientIP}`;
        autoIPLookUp = true;
    }else{
        ipinfourl = 'http://ipinfo.io';
        autoIPLookUp = false;
    }
    request.get(ipinfourl, function(error, response, ipinfoio) {
        ipinfoio = JSON.parse(ipinfoio);
        if(typeof req.params.place == 'undefined'){
            place = `${ipinfoio.region} ${ipinfoio.city}`;
        }else{
            place = req.params.place;
        }
        // Fetch the Google Maps API fot the lat and lng
        // Tips, Using the V3 you can fetch data without an API key, thanks Google :P
        request.get(`https://maps.google.com/maps/api/geocode/json?address=${place}`, (error, googleMapsResponse, googleMapsBody) => {
            googleMapsBody = JSON.parse(googleMapsBody)
            googleMapsBody = googleMapsBody.results[0];
            const lat = googleMapsBody.geometry.location.lat;
            const lng = googleMapsBody.geometry.location.lng;
            weather.find({
                // => Hong Kong Yuen Long
                search: place,
                degreeType: 'C',
            }, (error, payload) => {
                payload = payload[0]['current'];
                let imageURL;
                let dateStatus;
                let backgroundImage;
                const timePlace = payload.observationpoint.split(',')[0].trim();
                request.get(`http://api.timezonedb.com/v2/get-time-zone?key=${timezonedbtoken}&by=position&lat=${lat}&lng=${lng}&format=json`, (error, response, body) => {
                    body = JSON.parse(body);
                    const curHr = new Date(body.formatted).getHours();
                    if(curHr <= 6 || curHr >= 19) {
                        dateStatus = 'night';
                    }else if(curHr <= 18){
                        dateStatus = 'morning';
                    }else {
                        dateStatus = 'afternoon';
                    }

                    const skytext = payload.skytext.toLowerCase();
                    const weatherText = payload.skytext.replace(/ /igm, '').toLowerCase();
                    res.end(JSON.stringify({
                        image: `${rootURL}/image/${weatherText}?type=weather`,
                        weatherText: payload.skytext,
                        deg: parseInt(payload.temperature),
                        backgroundImage: `${rootURL}/image/${dateStatus}?type=background`,
                        dateStatus: dateStatus,
                        location: payload.observationpoint,
                        time: `${payload.day} ${body.formatted}`,
                        autoIPLookUp: autoIPLookUp,
                    }));
                });
            });
        });
    });
});

module.exports = router;
