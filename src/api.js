const express = require('express');
const router = express.Router();
const request = require('request');
const fs = require('fs');
const path = require('path');
const timezonedbtoken = require('./index').timezonedbtoken;

router.get('/:place?', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if(typeof req.params.place == 'undefined') {
        res.end(JSON.stringify({
            error: true,
            msg: 'Please pass in the location to look up',
        }));
        return false;
    }
    // Get the current user ip address
    const iplocation = require('iplocation');
    const publicIp = require('public-ip');
    publicIp.v4().then(ip => {
        iplocation((ip), (error, response) => {
            // Get the user location data
            const weather = require('weather-js');
            let place;
            request('http://ipinfo.io', function(error, response, ipinfoio) {
                ipinfoio = JSON.parse(ipinfoio);
                if(typeof req.params.place == 'undefined'){
                    place = `${ipinfoio.region} ${ipinfoio.city}`;
                }else{
                    place = req.params.place;
                }

                // Fetch the Google Maps API fot the lat and lng

                // Tips, Using the V3 you can fetch data without an API key, thanks Google :P

                request.get(`https://maps.google.com/maps/api/geocode/json?address=${place}`, (error, googleMapsResponse, googleMapsBody) => {
                    googleMapsBody = JSON.parse(googleMapsBody).results[0];
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

                            if(dateStatus == 'morning') {
                                backgroundImage = 'http://vignette1.wikia.nocookie.net/mlp/images/5/5f/Twilight_singing_%22for_absolute_certain%22_S03E13.png/revision/latest?cb=20130217092930'
                            }else if(dateStatus == 'afternoon') {
                                backgroundImage = 'http://orig12.deviantart.net/1704/f/2015/103/1/5/while_sunset_in_the_ponyville___2560_x_1440_hd_by_shaakuras-d8pjsyv.png';
                            }else if(dateStatus == 'night') {
                                backgroundImage = 'http://vignette2.wikia.nocookie.net/mlp/images/7/74/Ponyville_at_night_S4E14.png/revision/latest?cb=20140217121653';
                            }else{
                                backgroundImage = null;
                            }

                            const skytext = payload.skytext.toLowerCase();

                            const imageRegistry = {
                                rain: 'http://25.media.tumblr.com/tumblr_lvfpfnJqFJ1r40km4o1_400.gif',
                                clear: 'http://vignette4.wikia.nocookie.net/mlp/images/a/aa/Rainbow_Dash_with_sunglasses_crop_S02E03.png/revision/latest?cb=20121212063802',
                                sunny: 'http://vignette4.wikia.nocookie.net/mlp/images/a/aa/Rainbow_Dash_with_sunglasses_crop_S02E03.png/revision/latest?cb=20121212063802',
                                cloudy: 'https://derpicdn.net/img/2014/12/1/775587/full.gif'
                            };
                            for(let key in imageRegistry){
                                if(skytext.includes(key)){
                                    imageURL = imageRegistry[key];
                                    break;
                                }else{
                                    imageURL = payload.imageUrl;
                                }
                            }
                            res.end(JSON.stringify({
                                image: imageURL,
                                weatherText: payload.skytext,
                                deg: payload.temperature,
                                backgroundImage: backgroundImage,
                                dateStatus: dateStatus,
                                location: payload.observationpoint,
                                time: `${payload.day} ${body.formatted}`,
                            }))
                        });
                    });
                });
            })
        });
    });
});

module.exports = router;
