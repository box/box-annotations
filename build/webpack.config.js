require('babel-polyfill');

const isRelease = process.env.NODE_ENV === 'production';
const isDev = process.env.NODE_ENV === 'dev';

const path = require('path');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const RsyncPlugin = require('./RsyncPlugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const { BannerPlugin } = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const commonConfig = require('./webpack.common.config');
const license = require('./license');
const fs = require('fs');

let rsyncLocation = '';
if (fs.existsSync('build/rsync.json')) {
    /* eslint-disable */
    const rsyncConf = require('./rsync.json');
    rsyncLocation = rsyncConf.location;
    /* eslint-enable */
}

/* eslint-disable key-spacing, require-jsdoc */
const config = Object.assign(commonConfig(), {
    entry: {
        annotations: ['./src/BoxAnnotations.js']
    },
    output: {
        path: path.resolve('lib'),
        filename: '[Name].js'
    }
});

if (isDev) {
    // If build/rsync.json exists, rsync bundled files to specified directory
    if (rsyncLocation) {
        config.plugins.push(new RsyncPlugin('lib/.', rsyncLocation));
    }

    // Add inline source map
    config.devtool = 'inline-source-map';
}

if (isRelease) {
    config.plugins.push(
        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: '../reports/webpack-stats.html',
            generateStatsFile: true,
            statsFilename: '../reports/webpack-stats.json'
        })
    );

    // https://webpack.js.org/configuration/optimization/#optimization-minimize
    config.optimization = {
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    warnings: false, // Don't output warnings
                    compress: {
                        drop_console: true // Drop console statements
                    },
                    output: {
                        comments: false // Remove comments
                    }
                },
                sourceMap: false
            })
        ]
    };

    // Optimize CSS - minimize, remove comments and duplicate rules
    config.plugins.push(
        new OptimizeCssAssetsPlugin({
            cssProcessorOptions: {
                discardComments: { removeAll: true },
                safe: true
            }
        })
    );

    // Add license message to top of code
    config.plugins.push(new BannerPlugin(license));
}

module.exports = config;
