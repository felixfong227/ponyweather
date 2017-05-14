const express = require('express');
const router = express.Router();
const request = require('request');
const fs = require('fs');
const path = require('path');

router.get('/:place?', (req, res) => {
    // Fetch the user current location
    request('http://ipinfo.io', function(error, response, ipinfoio) {
        if(error) {
            console.log(error);
        }else{
            ipinfoio = JSON.parse(ipinfoio);
            const url = 'http://localhost:8080/api/';
            let place;
            if(typeof req.params.place == 'undefined') {
                place = `${ipinfoio.region} ${ipinfoio.city}`;
            }else{
                place = req.params.place;
            }
            // Fetch teh Pony Weather API
            request(`${url}${place}`, (error, response, body) => {
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
