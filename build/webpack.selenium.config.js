require('babel-polyfill');

const isRelease = process.env.NODE_ENV === 'production';
const isDev = process.env.NODE_ENV === 'dev';

const path = require('path');
const commonConfig = require('./webpack.common.config');
const { UglifyJsPlugin } = require('webpack').optimize;
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { BannerPlugin } = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const license = require('./license');

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
