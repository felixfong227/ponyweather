const express = require('express');
const router = express.Router();
const request = require('request');
const fs = require('fs');
const path = require('path');

router.get('/:place?', (req, res) => {
    const rootURL = req.protocol + '://' + req.get('host');
    // Fetch the user current location
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
    let ipinfourl;
    if(clientIP !== '::1' ){
        ipinfourl = `http://ipinfo.io/${clientIP}`
    }else{
        ipinfourl = 'http://ipinfo.io';
    }
    request(ipinfourl, function(error, response, ipinfoio) {
        if(error) {
            console.log(error);
        }else{
            ipinfoio = JSON.parse(ipinfoio);
            const url = `${rootURL}/api`;
            let place;
            if(typeof req.params.place == 'undefined') {
                place = `${ipinfoio.region} ${ipinfoio.city}`;
            }else{
                place = req.params.place;
            }
            // Fetch teh Pony Weather API
            request(`${url}/${place}`, (error, response, body) => {
                if(error) {
                    console.log(error)
                }else{
                    body = JSON.parse(body);
                    res.render('output', body);
                }
            });
        }
    });
});

module.exports = router;
