require('babel-polyfill');

const path = require('path');
const commonConfig = require('./webpack.common.config');

/* eslint-disable key-spacing, require-jsdoc */
const config = Object.assign(commonConfig(), {
    entry: {
        annotations: ['./src/BoxAnnotations.js']
    },
    output: {
        path: path.resolve('functional-tests/lib'),
        filename: '[Name].js'
    }
});

config.devtool = 'inline-source-map';

module.exports = config;
