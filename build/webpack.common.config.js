const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { DefinePlugin } = require('webpack');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

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
            modules: ['src', 'node_modules']
        },
        devServer: {
            host: '0.0.0.0'
        },
        resolveLoader: {
            modules: [path.resolve('src'), path.resolve('node_modules')]
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    exclude: [path.resolve('node_modules')]
                },
                {
                    test: /\.s?css$/,
                    use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader']
                },
                {
                    test: /\.(svg|html)$/,
                    loader: 'raw-loader',
                    exclude: [path.resolve('node_modules')]
                },
                {
                    test: /\.(jpe?g|png|gif|woff2|woff)$/,
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]'
                    },
                    exclude: [path.resolve('node_modules')]
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
            })
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
};
