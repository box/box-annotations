const path = require('path');

module.exports = {
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader'
            },
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    minetype: 'application/font-woff/',
                    name: 'fonts/[name].[ext]'
                }
            },
            {
                test: /\.png$/,
                loader: 'url-loader'
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
            }
        ]
    },
    resolve: {
        alias: {
            // Map to uncompiled source code so we get nice source maps for debugging
            'box-annotations/lib': path.join(__dirname, '../src'),
            examples: path.join(__dirname, '../examples/src'),
            Wrapper: path.join(__dirname, '../examples/Wrapper'),
            'rsg-components/Wrapper': path.join(
                __dirname,
                '../examples/Wrapper',
            ),
        }
    }
};
