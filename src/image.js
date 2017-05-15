const express = require('express');
const router = express.Router();
const request = require('request').defaults({ encoding: null });
const fs = require('fs');
const path = require('path');

const imageTypes = {
    background: {
        morning: 'http://vignette1.wikia.nocookie.net/mlp/images/5/5f/Twilight_singing_%22for_absolute_certain%22_S03E13.png/revision/latest?cb=20130217092930',
        afternoon: 'http://orig12.deviantart.net/1704/f/2015/103/1/5/while_sunset_in_the_ponyville___2560_x_1440_hd_by_shaakuras-d8pjsyv.png',
        night: 'http://vignette2.wikia.nocookie.net/mlp/images/7/74/Ponyville_at_night_S4E14.png/revision/latest?cb=20140217121653',
    },
    weather: {
        rain: 'http://25.media.tumblr.com/tumblr_lvfpfnJqFJ1r40km4o1_400.gif',
        clear: 'http://vignette4.wikia.nocookie.net/mlp/images/a/aa/Rainbow_Dash_with_sunglasses_crop_S02E03.png/revision/latest?cb=20121212063802',
        sunny: 'http://vignette4.wikia.nocookie.net/mlp/images/a/aa/Rainbow_Dash_with_sunglasses_crop_S02E03.png/revision/latest?cb=20121212063802',
        cloudy: 'https://derpicdn.net/img/2014/12/1/775587/full.gif',
    },
};


router.get('/:status?', (req, res) => {
    let status = req.params.status;
    const type = req.query.type;
    let findType = false;
    if(typeof type == 'undefined') {
        res.end(JSON.stringify({
            error: true,
            msg: 'Please pass in the image type',
        }));
        return false;
    }

    for(let key in imageTypes){
        if(type.includes(key)){
            findType = true;
            break;
        }
    }
    if(!findType){
        res.end(JSON.stringify({
            error: true,
            msg: 'Can not find the correct image type',
        }));
        return false;
    }

    let findit = false;
    for(let key in imageTypes[type]){
        if( status.includes(key) ){
            findit = true;
            status = key;
            break;
        }
    }
    if(findit){
        request(imageTypes[type][status], (error, response, body) => {
            if(error){
                console.log(error);
            }else{
                res.setHeader('Content-Type', response.headers['content-type'] );
                res.send(body);
            }
        });
    }else{
        res.end(JSON.stringify({
            error: true,
            msg: 'Can not find the right date status image',
        }));
    }
});

module.exports = router;