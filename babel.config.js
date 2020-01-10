module.exports = api => {
    api.cache(() => process.env.NODE_ENV);

    return {
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
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-proposal-object-rest-spread',
            '@babel/plugin-transform-flow-strip-types',
            '@babel/plugin-transform-object-assign',
            [
                'react-intl',
                {
                    messagesDir: './i18n/json',
                },
            ],
        ],
        env: {
            production: {
                plugins: [['react-remove-properties', { properties: ['data-testid'] }]],
            },
            test: {
                plugins: ['@babel/plugin-transform-modules-commonjs'],
            },
        },
    };
};
