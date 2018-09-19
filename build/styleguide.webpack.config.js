const path = require('path');
const { DefinePlugin } = require('webpack');

const language = 'en-US';
const locale = 'en';

module.exports = {
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader'
            },
            {
                test: /\.s?css$/,
                use: ['style-loader', 'css-loader', 'sass-loader']
            },
            {
                test: /\.html$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]'
                }
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
            __NAME__: JSON.stringify('name'),
            __VERSION__: JSON.stringify('version'),
            __LANGUAGE__: JSON.stringify(language)
        })
    ],
    resolve: {
        alias: {
            // Map to uncompiled source code so we get nice source maps for debugging
            'box-annotations/lib': path.join(__dirname, '../src'),
            'react-intl-locale-data': path.resolve(`node_modules/react-intl/locale-data/${locale}`),
            'box-annotations-locale-data': path.resolve(`i18n/${language}`),
            'box-react-ui-locale-data': path.resolve(`node_modules/box-react-ui/i18n/${language}`),
            examples: path.join(__dirname, '../examples/src'),
            Wrapper: path.join(__dirname, '../examples/Wrapper'),
            'rsg-components/Wrapper': path.join(
                __dirname,
                '../examples/Wrapper',
            ),
        }
    }
};
