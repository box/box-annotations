/* eslint-disable */
const webpackConfig = require('./webpack.karma.config');

const getTestFile = (src) => {
    if (!src) {
        return [
            'src/**/*-test.js',
            'src/**/*-test.html'
        ];
    }

    if (src.endsWith('/')) {
        return [
            `src/${src}**/*-test.js`,
            `src/${src}**/*-test.html`
        ];
    }

    const frags = src.split('/');
    const fileName = frags[frags.length - 1];
    if (!fileName) {
        throw new Error('Incorrect path to source file');
    }

    const path = src.replace(fileName, '');
    const base = path ? `src/${path}` : 'src';
    return [
        `${base}/__tests__/${fileName}-test.js`,
        `${base}/__tests__/${fileName}-test.html`
    ];
};

module.exports = (config) => config.set({
    autoWatch: false,

    basePath: '..',

    browserConsoleLogOptions: {
        level: 'log',
        format: '%b %T: %m',
        terminal: true
    },

    browsers: ['PhantomJS'],

    browserNoActivityTimeout: 100000,

    captureConsole: true,

    colors: true,

    coverageReporter: {
        check: config.src ? {} : {
            global: {
                statements: 80,
                branches: 80,
                functions: 80,
                lines: 80
            }
        },
        reporters: [
            {
                type: 'html',
                dir: 'reports/coverage/html'
            },
            {
                type: 'cobertura',
                dir: 'reports/coverage/cobertura'
            },
            { type: 'text' }
        ]
    },

    junitReporter: {
        outputDir: 'reports/coverage/junit',
        outputFile: 'junit.xml'
    },

    frameworks: [
        'mocha',
        'sinon-stub-promise',
        'chai-sinon',
        'chai-dom',
        'chai',
        'sinon',
        'fixture'
    ],

    files: [
        'node_modules/babel-polyfill/dist/polyfill.js'
    ].concat(getTestFile(config.src)),

    exclude: [],

    preprocessors: {
        'src/**/*-test.js': ['webpack', 'sourcemap'],
        'src/**/*-test.html': ['html2js']
    },

    phantomjsLauncher: {
        exitOnResourceError: false
    },

    port: 9876,

    reporters: ['mocha', 'coverage', 'junit'],

    logLevel: config.LOG_ERROR,

    singleRun: true,

    webpack: webpackConfig,

    webpackMiddleware: {
        noInfo: true
    }
});
