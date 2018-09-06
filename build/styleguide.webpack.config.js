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
