const path = require('path');
const TranslationsPlugin = require('@box/i18n/TranslationsPlugin.js');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const fs = require('fs');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const safeParser = require('postcss-safe-parser');
const license = require('./license');
const RsyncPlugin = require('./RsyncPlugin');
const packageJSON = require('../package.json');

const { DefinePlugin, BannerPlugin } = webpack;
const isRelease = process.env.NODE_ENV === 'production';
const isDev = process.env.NODE_ENV === 'dev';
const language = process.env.LANGUAGE;
const outputDir = process.env.OUTPUT;
const locale = language.substr(0, language.indexOf('-'));
const version = isRelease ? packageJSON.version : 'dev';
const outputPath = outputDir ? path.resolve(outputDir) : path.resolve('lib');
const propsDir = path.resolve('i18n'); // Where the .properties files are dumped
const jsonDir = path.join(propsDir, 'json'); // Where the react-intl plugin dumps json
const Translations = new TranslationsPlugin(propsDir, jsonDir);

let rsyncLocation = '';
if (fs.existsSync('build/rsync.json')) {
    /* eslint-disable */
    const rsyncConf = require('./rsync.json');
    rsyncLocation = rsyncConf.location;
    /* eslint-enable */
}

/* eslint-disable key-spacing, require-jsdoc */
const config = {
    entry: {
        annotations: ['./src/BoxAnnotations.js']
    },
    output: {
        path: outputPath,
        filename: '[name].js'
    },
    resolve: {
        modules: ['src', 'node_modules'],
        alias: {
            'examples':  path.join(__dirname, '../examples/src'),
            'react-intl-locale-data': path.resolve(`node_modules/react-intl/locale-data/${locale}`),
            'box-annotations-locale-data': path.resolve(`i18n/${language}`),
            'box-react-ui-locale-data': path.resolve(`node_modules/box-react-ui/i18n/${language}`),
            moment: path.resolve('src/MomentShim') // Hack to leverage Intl instead
        }
    },
    devServer: {
        host: '0.0.0.0'
    },
    resolveLoader: {
        modules: [path.resolve('src'), path.resolve('third-party'), path.resolve('node_modules')]
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /(node_modules)/
            },
            {
                test: /\.s?css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader']
            },
            {
                test: /\.(svg|html)$/,
                loader: 'raw-loader',
                exclude: /(node_modules)/
            },
            {
                test: /\.(jpe?g|png|gif|woff2|woff)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]'
                },
                exclude: /(node_modules)/
            }
        ]
    },
    plugins: [
        new DefinePlugin({
            __NAME__: JSON.stringify(packageJSON.name),
            __LANGUAGE__: JSON.stringify(language),
            __VERSION__: JSON.stringify(version),
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV),
                BABEL_ENV: JSON.stringify(process.env.BABEL_ENV)
            }
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css'
        }),
        new OptimizeCssAssetsPlugin({
            cssProcessorOptions: {
                discardComments: { removeAll: true },
                parser: safeParser,
            }
        }),
        new BannerPlugin(license)
    ],
    stats: {
        assets: true,
        colors: true,
        version: false,
        hash: false,
        timings: true,
        chunks: false,
        chunkModules: false,
        children: false
    }
};

if (isDev) {
    // If build/rsync.json exists, rsync bundled files to specified directory
    if (rsyncLocation) {
        config.plugins.push(new RsyncPlugin('lib/.', rsyncLocation));
    }

    // Add inline source map
    config.devtool = 'source-map';
    config.plugins.push(Translations);
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
            reportFilename: path.resolve('reports/webpack-stats.html'),
            generateStatsFile: true,
            statsFilename: path.resolve('reports/webpack-stats.json')
        })
    );
}

if (isRelease) {
    // Add license message to top of code
    config.plugins.push(new BannerPlugin(license));
}

module.exports = config;
