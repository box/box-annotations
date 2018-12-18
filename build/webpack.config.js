require('babel-polyfill');
const path = require('path');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const { BannerPlugin } = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const fs = require('fs');

const license = require('./license');
const commonConfig = require('./webpack.common.config');
const TranslationsPlugin = require('./TranslationsPlugin');
const RsyncPlugin = require('./RsyncPlugin');

const isRelease = process.env.NODE_ENV === 'production';
const isDev = process.env.NODE_ENV === 'dev';
const language = process.env.LANGUAGE;
const locale = language.substr(0, language.indexOf('-'));

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
    },
    resolve: {
        modules: ['src', 'node_modules'],
        alias: {
            examples: path.join(__dirname, '../examples/src'),
            'react-intl-locale-data': path.resolve(`node_modules/react-intl/locale-data/${locale}`),
            'box-annotations-locale-data': path.resolve(`i18n/${language}`),
            'box-react-ui-locale-data': path.resolve(`node_modules/box-react-ui/i18n/${language}`),
            moment: path.resolve('src/MomentShim') // Hack to leverage Intl instead
        }
    },
    devServer: {
        contentBase: './test',
        inline: true
    }
});

if (isDev) {
    // If build/rsync.json exists, rsync bundled files to specified directory
    if (rsyncLocation) {
        config.plugins.push(new RsyncPlugin('lib/.', rsyncLocation));
    }

    // Add inline source map
    config.devtool = 'source-map';
    config.plugins.push(new TranslationsPlugin());
    config.plugins.push(
        new CircularDependencyPlugin({
            exclude: /node_modules/,
            failOnError: true
        })
    );
}

if (isRelease && language === 'en-US') {
    config.plugins.push(
        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: path.resolve('../reports/webpack-stats.html'),
            generateStatsFile: true,
            statsFilename: path.resolve('../reports/webpack-stats.json`')
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
