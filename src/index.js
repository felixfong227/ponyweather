const expess = require('express');
const app = expess();
const port = 8080;
const request = require('request');
const fs = require('fs');
const path = require('path');
const getIP = require('ipware')().get_ip;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

app.set('view engine', 'ejs');

app.use('/', require('./webview'));

// GET
app.use('/api', require('./api'));