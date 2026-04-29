const fs = require('fs');
const path = require('path');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const RsyncPlugin = require('@box/frontend/webpack/RsyncPlugin');
const TranslationsPlugin = require('@box/frontend/webpack/TranslationsPlugin');

const { BannerPlugin } = require('webpack');

const license = require('./license');
const commonConfig = require('./webpack.common.config');

const isDev = process.env.NODE_ENV === 'dev';
const isLinked = process.env.IS_LINKED === '1';
const isRelease = process.env.NODE_ENV === 'production';
const language = process.env.LANGUAGE || 'en-US';
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
        annotations: ['./src/BoxAnnotations.ts'],
    },
    externals: [
        // @box/threaded-annotations and its transitive dependencies are provided
        // by the consuming application (EUA) at runtime. Bundling them here would
        // duplicate code and cause webpack 4 / ESM exports compatibility issues.
        /^@box\/threaded-annotations/,
        /^@box\/blueprint-web/,
        /^@box\/blueprint-web-assets/,
        /^@box\/collaboration-popover/,
        /^@box\/readable-time/,
        /^@box\/user-selector/,
        /^@box\/combobox-with-api/,
        /^@tiptap\//,
    ],
    output: {
        filename: '[name].js',
        path: path.resolve('dist'),
    },
    resolve: {
        alias: {
            'box-annotations-locale-data': path.resolve(`./i18n/${language}`),
            'box-elements-messages': path.resolve(`node_modules/box-ui-elements/i18n/${language}`),
            'react-intl-relativetimeformat-locale-data': path.resolve(
                `node_modules/@formatjs/intl-relativetimeformat/dist/locale-data/${locale}`,
            ),
            'react-intl-pluralrules-locale-data': path.resolve(
                `node_modules/@formatjs/intl-pluralrules/dist/locale-data/${locale}`,
            ),
        },
        extensions: ['.tsx', '.ts', '.js'],
        modules: ['src', 'node_modules'],
    },
    devServer: {
        static: './test',
        allowedHosts: 'all',
        host: '0.0.0.0',
        port: 8001,
    },
});

if (isDev) {
    if (rsyncLocation) {
        config.plugins.push(new RsyncPlugin('dist/.', rsyncLocation, 'annotations'));
    }

    config.devtool = isLinked ? 'eval-cheap-module-source-map' : 'source-map';
    config.plugins.push(new TranslationsPlugin());
    config.plugins.push(
        new CircularDependencyPlugin({
            exclude: /node_modules/,
            failOnError: true,
        }),
    );
}

if (isRelease && language === 'en-US') {
    config.optimization = {
        minimizer: [
            '...',
            new CssMinimizerPlugin(),
        ],
    };

    // Add license message to top of code
    config.plugins.push(new BannerPlugin(license));
}

module.exports = config;
