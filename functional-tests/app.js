/* eslint-disable func-names, require-jsdoc, prefer-arrow-callback, no-console */
const express = require('express');
const path = require('path');
const BoxSDK = require('box-node-sdk');

const {
    FILE_ID,
    ACCESS_TOKEN,
    CLIENT_ID
} = process.env;

const app = express();
const server = app.listen(8080, function() {
    console.log('Example app listening on port 8080!');
});

// Set up SDK & client
const sdk = new BoxSDK({
    clientID: CLIENT_ID,
    clientSecret: 'NUH UH'
});
const client = sdk.getBasicClient(ACCESS_TOKEN);

app.use(express.static(path.join(__dirname, 'lib')));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// this function is called when you want the server to die gracefully
// i.e. wait for existing connections
function gracefulShutdown() {
    console.log('Received kill signal, shutting down gracefully.');
    server.close(function() {
        console.log('Closed out remaining connections.');
        process.exit();
    });

    // if after
    setTimeout(function() {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit();
    }, 10*1000);
}

function errorCallback(err) {
    console.log(err);
    gracefulShutdown();
}

// viewed at http://localhost:8080
app.get('/', function(req, res) {
    const url = `https://api.box.com/2.0/files/${FILE_ID}`;
    const options = {
        actor: {
            id: '3504101558',
            name: 'Kanye West'
        }
    };

    client.exchangeToken(['item_preview'], url, options)
        .then(function (tokenInfo) {
            // tokenInfo.accessToken contains the new annotator token
            res.render('index', { token: tokenInfo.accessToken, file_id: FILE_ID });
        })
        .catch(errorCallback);
});

// listen for TERM signal .e.g. kill
process.on ('SIGTERM', gracefulShutdown);

// listen for INT signal e.g. Ctrl-C
process.on ('SIGINT', gracefulShutdown);