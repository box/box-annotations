const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { DefinePlugin, NormalModuleReplacementPlugin } = require('webpack');
const packageJSON = require('../package.json');

const language = process.env.LANGUAGE;
const isRelease = process.env.NODE_ENV === 'production';
const version = isRelease ? packageJSON.version : 'dev';

/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
module.exports = () => {
    return {
        bail: true,
        resolve: {
            modules: ['src', 'node_modules'],
        },
        module: {
            rules: [
                {
                    test: /\.(js|ts|tsx)$/,
                    loader: 'babel-loader',
                    exclude: /node_modules\/(?!(react-intl|intl-messageformat|intl-messageformat-parser)\/).*/,
                },
                // Transpile redux-toolkit
                {
                    test: /\.(js|ts|tsx)$/,
                    loader: 'babel-loader',
                    include: /@reduxjs\/toolkit.*/,
                },
                {
                    test: /\.s?css$/,
                    use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader'],
                },
                {
                    test: /\.(svg|html)$/,
                    loader: 'raw-loader',
                    exclude: [path.resolve('node_modules')],
                },
                {
                    test: /\.(jpe?g|png|gif|woff2|woff)$/,
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                    },
                    exclude: [path.resolve('node_modules')],
                },
            ],
        },
        performance: {
            maxAssetSize: 1000000,
            maxEntrypointSize: 1000000,
        },
        plugins: [
            new DefinePlugin({
                __LANGUAGE__: JSON.stringify(language),
                __NAME__: JSON.stringify(packageJSON.name),
                __VERSION__: JSON.stringify(version),
                'process.env': {
                    BABEL_ENV: JSON.stringify(process.env.BABEL_ENV),
                    NODE_ENV: JSON.stringify(process.env.NODE_ENV),
                },
            }),
            new MiniCssExtractPlugin({
                filename: '[name].css',
            }),
            new NormalModuleReplacementPlugin(/\/iconv-loader$/),
        ],
        stats: {
            assets: true,
            colors: true,
            version: false,
            hash: false,
            timings: true,
            chunks: false,
            chunkModules: false,
            children: false,
        },
    };
};
