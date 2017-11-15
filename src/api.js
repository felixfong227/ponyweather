/* eslint max-len: ["error", { "ignoreComments": true }] */
/* eslint max-len: ["error", 200]*/
const express = require('express');
const router = new express.Router;
const worldtimeiotoken = require('./index').worldtimeiotoekn;
const googlekey = require('./index').googlekey;
let autoIPLookUp = false;
let responseObject = {};

let lat;
let lng;

let dateStatus;
const rp = require('request-promise');

router.get('/embed/:place?', (req, res) => {
    let place = req.params.place || 'Tokyo';
    res.render('embed', {
        place,
    });
});

router.get('/:place?', (req, res) => {
    const rootURL = req.protocol + '://' + req.get('host');
    const clientIP = req.headers['x-forwarded-for']
        || req.connection.remoteAddress
        || req.ip;

    const type = req.query.type;
    let ipinfourl;
    res.setHeader('Content-Type', 'application/json');
    // Get the current user ip address
    // Get the user location data
    let place;
    let clientPlace;
    if( typeof req.params.place == 'undefined' && clientIP !== '::1') {
        ipinfourl = `http://ipinfo.io/${clientIP}`;
        autoIPLookUp = true;
    }else{
        ipinfourl = 'http://ipinfo.io';
        autoIPLookUp = false;
    }
    rp.get(ipinfourl)
    .then((response) => {
        response = JSON.parse(response);
        place = response.region;
        if(typeof req.params.place !== 'undefined') {
            clientPlace = req.params.place;
        }else{
            clientPlace = `${response.region} ${response.city}`;
        }
        return rp.get(`https://maps.google.com/maps/api/geocode/json?address=${clientPlace}&key=${googlekey}`);
    })
    .then((response) => {
        response = JSON.parse(response);
        response = response.results[0];
        lat = response.geometry.location.lat;
        lng = response.geometry.location.lng;
        responseObject['location'] = response.formatted_address;
        // Fetch the woeid
        return rp.get(`https://www.metaweather.com/api/location/search/?query=${place}`);
    })
    .then((response) => {
        response = JSON.parse(response);
        // Get the first one
        const woeid = response[0].woeid;
        // Fetch the weather data
        return rp.get(`https://www.metaweather.com/api/location/${woeid}`);
    })
    .then((response) => {
        response = JSON.parse(response);
        const weatherData = response.consolidated_weather[0];
        responseObject['weather'] = weatherData;
        // Fetch the date and time
        return rp.get({
            url: `https://worldtimeiofree.p.mashape.com/geo?latitude=${lat}&longitude=${lng}`,
            headers: {
                'X-Mashape-Key': 'XX8qZvf4jjmshIjcf6yIwR7TEeV0p1k3QFpjsn9fgzPwUnCWPK',
                'Accept': 'application/json',
            },
        });
    })
    .then((response) => {
        response = JSON.parse(response);
        const curDate = new Date(response.summary.local);
        const curHr = curDate.getHours();
        if(curHr <= 6 || curHr >= 19) {
            dateStatus = 'night';
        }else if(curHr <= 18) {
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
        responseObject['date']['formatted'] = curDate.toString();
        responseObject['auto_ip_look_up'] = autoIPLookUp;
        responseObject['map'] = `${rootURL}/api/embed/${responseObject.location}`;
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
        }else if(type == 'xml') {
            const js2xmlparser = require('js2xmlparser');
            res.set('Content-Type', 'text/xml');
            res.end(js2xmlparser.parse('result', responseObject));
        } else{
            res.end(JSON.stringify(responseObject));
        }
    })
    .catch((error) => {
        console.log(error);
    });
});

module.exports = router;
