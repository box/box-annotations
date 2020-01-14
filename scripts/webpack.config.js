const fs = require('fs');
const path = require('path');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const RsyncPlugin = require('@box/frontend/webpack/RsyncPlugin');
const TranslationsPlugin = require('@box/frontend/webpack/TranslationsPlugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const { BannerPlugin } = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const license = require('./license');
const commonConfig = require('./webpack.common.config');

const isDev = process.env.NODE_ENV === 'dev';
const isRelease = process.env.NODE_ENV === 'production';
const language = process.env.LANGUAGE;
const locale = language.substr(0, language.indexOf('-'));

let rsyncLocation = '';
if (fs.existsSync('scripts/rsync.json')) {
    /* eslint-disable */
    const rsyncConf = require('./rsync.json');
    rsyncLocation = rsyncConf.location;
    /* eslint-enable */
}

/* eslint-disable key-spacing, require-jsdoc */
const config = Object.assign(commonConfig(), {
    entry: {
        annotations: ['./src/BoxAnnotations.js'],
    },
    output: {
        path: path.resolve('dist'),
        filename: '[Name].js',
    },
    resolve: {
        alias: {
            'box-annotations-locale-data': path.resolve(`i18n/${language}`),
            'box-elements-messages': path.resolve(`node_modules/box-ui-elements/i18n/${language}`),
            'react-intl-locale-data': path.resolve(`node_modules/react-intl/locale-data/${locale}`),
            moment: path.resolve('src/utils/MomentShim'), // Hack to leverage Intl instead
        },
        modules: ['src', 'node_modules'],
    },
    devServer: {
        contentBase: './test',
        disableHostCheck: true,
        host: '0.0.0.0',
        inline: true,
        port: 8001,
    },
});

if (isDev) {
    if (rsyncLocation) {
        config.plugins.push(new RsyncPlugin('dist/.', rsyncLocation, 'annotations'));
    }

    // Add inline source map
    config.devtool = 'source-map';
    config.plugins.push(new TranslationsPlugin());
    config.plugins.push(
        new CircularDependencyPlugin({
            exclude: /node_modules/,
            failOnError: true,
        }),
    );
}

if (isRelease && language === 'en-US') {
    config.plugins.push(
        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: path.resolve('../reports/webpack-stats.html'),
            generateStatsFile: true,
            statsFilename: path.resolve('../reports/webpack-stats.json`'),
        }),
    );

    // https://webpack.js.org/configuration/optimization/#optimization-minimize
    config.optimization = {
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    warnings: false, // Don't output warnings
                    compress: {
                        drop_console: true, // Drop console statements
                    },
                    output: {
                        comments: false, // Remove comments
                    },
                },
                sourceMap: false,
            }),
        ],
    };

    // Optimize CSS - minimize, remove comments and duplicate rules
    config.plugins.push(
        new OptimizeCssAssetsPlugin({
            cssProcessorOptions: {
                discardComments: { removeAll: true },
                safe: true,
            },
        }),
    );

    // Add license message to top of code
    config.plugins.push(new BannerPlugin(license));
}

module.exports = config;
