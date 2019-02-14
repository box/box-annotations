module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                modules: false,
            },
        ],
        '@babel/preset-react',
        '@babel/preset-flow',
    ],
    plugins: [
        '@babel/plugin-transform-flow-strip-types',
        '@babel/plugin-transform-object-assign',
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-object-rest-spread',
        [
            'module-resolver',
            {
                alias: {
                    api: './src/api',
                    components: './src/components',
                    icons: './src/icons',
                    controllers: './src/controllers',
                    doc: './src/doc',
                    image: './src/image',
                    drawing: './src/drawing',
                },
            },
        ],
    ],
    env: {
        dev: {
            plugins: ['flow-react-proptypes'],
        },
    },
};
