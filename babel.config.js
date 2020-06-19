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
            '@babel/preset-typescript',
        ],
        plugins: [
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-proposal-object-rest-spread',
            '@babel/plugin-transform-flow-strip-types', // Required for jest coverage, for some reason
            '@babel/plugin-transform-object-assign',
            '@babel/plugin-transform-runtime',
            [
                'react-intl',
                {
                    messagesDir: './i18n/json',
                },
            ],
        ],
        env: {
            test: {
                plugins: ['@babel/plugin-transform-modules-commonjs'],
            },
        },
    };
};
