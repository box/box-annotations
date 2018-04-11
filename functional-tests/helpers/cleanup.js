/* eslint-disable func-names, prefer-arrow-callback, require-jsdoc, no-console */
const BoxSDK = require('box-node-sdk');

const {
    FILE_ID,
    FILE_VERSION_ID,
    ACCESS_TOKEN,
    CLIENT_ID
} = process.env;

const sdk = new BoxSDK({
    clientID: CLIENT_ID,
    clientSecret: 'NUH UH'
});
const client = sdk.getBasicClient(ACCESS_TOKEN);

function deleteAnnotation(annotation) {
    const { id } = annotation;
    client.del(`/annotations/${id}`, {}, function(err) {
        if (err) {
            // handle error
            throw err;
        }
        console.log(`Annotation ID ${id} was deleted`);
    });
}

module.exports = function() {
    client.get(`/files/${FILE_ID}/annotations?version=${FILE_VERSION_ID}`, {}, function(err, response) {
        if (err) {
            // handle error
            throw err;
        }

        const { entries } = response.body;
        if (!entries) {
            console.log('File does not have any existing annotations');
            return;
        }

        console.log(`Deleting ${entries.length} annotations`);
        entries.forEach(deleteAnnotation);
    });
}