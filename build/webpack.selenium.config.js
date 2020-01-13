const path = require('path');
const commonConfig = require('./webpack.common.config');

const language = process.env.LANGUAGE;
const locale = language.substr(0, language.indexOf('-'));
/* eslint-disable key-spacing, require-jsdoc */
const config = Object.assign(commonConfig(), {
    entry: {
        annotations: ['./src/BoxAnnotations.js'],
    },
    output: {
        path: path.resolve('functional-tests/lib'),
        filename: '[Name].js',
    },
    resolve: {
        modules: ['src', 'node_modules'],
        alias: {
            'box-annotations-locale-data': path.resolve(`i18n/${language}`),
            'box-elements-messages': path.resolve(`node_modules/box-ui-elements/i18n/${language}`),
            'react-intl-locale-data': path.resolve(`node_modules/react-intl/locale-data/${locale}`),
            examples: path.join(__dirname, '../examples/src'),
            moment: path.resolve('src/MomentShim'), // Hack to leverage Intl instead
        },
    },
});

config.devtool = 'inline-source-map';

module.exports = config;
