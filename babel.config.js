module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                modules: false,
                'targets': {
                    'browsers': ['last 1 Chrome versions', 'last 1 Firefox versions']
                }
            },
        ],
        '@babel/preset-react',
        '@babel/preset-flow',
    ],
    plugins: [
        '@babel/plugin-syntax-dynamic-import',
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
            plugins: [
                'flow-react-proptypes',
                [
                    'transform-es2015-arrow-functions',
                    {
                        'spec': true
                    }
                ],
                [
                    'react-intl',
                    {
                        'enforceDescriptions': true,
                        'messagesDir': './i18n/json'
                    }
                ]
            ],
        },
        test: {
            plugins: [
                '@babel/plugin-transform-modules-commonjs',
                'dynamic-import-node', // https://github.com/facebook/jest/issues/5920
                [
                    'react-intl',
                    {
                        enforceDescriptions: false,
                    },
                ],
            ],
        },
    },
};
