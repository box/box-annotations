require('babel-polyfill');

const commonConfig = require('./webpack.common.config');

module.exports = Object.assign(commonConfig(), {
    devtool: 'inline-source-map',
    resolve: {
        alias: {
            sinon: 'sinon/pkg/sinon'
        }
    },
    externals: {
        mocha: 'mocha'
    }
});
