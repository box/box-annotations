const fs = require('fs');
const path = require('path');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const RsyncPlugin = require('@box/frontend/webpack/RsyncPlugin');
const TranslationsPlugin = require('@box/frontend/webpack/TranslationsPlugin');

const { BannerPlugin } = require('webpack');

const license = require('./license');
const commonConfig = require('./webpack.common.config');

// Provided by the consuming application at runtime; kept out of the bundle to
// avoid duplicating code the host app already ships. The react family must
// stay commonjs: module externals are assumed to be spec ESM at build time,
// which strips Babel's _interopRequireDefault checks from bundled CJS code;
// consumers that provide CJS react then crash on namespace.default access.
const commonjsExternals = ['react', 'react-dom', 'react-intl', 'react-redux'];
// These ship ESM, so they are externalized as module imports, which lets the
// consumer's bundler tree-shake their unused exports. '@tiptap' matches the
// whole scope.
const moduleExternals = [
    '@box/blueprint-web',
    '@box/blueprint-web-assets',
    '@box/collaboration-popover',
    '@box/combobox-with-api',
    '@box/readable-time',
    '@box/threaded-annotations',
    '@box/user-selector',
    '@tiptap',
];
const matchesPackage = (request, name) => request === name || request.startsWith(`${name}/`);

const isDev = process.env.NODE_ENV === 'dev';
const isDevServer = Boolean(process.env.WEBPACK_SERVE);
const isLinked = process.env.IS_LINKED === '1';
const isRelease = process.env.NODE_ENV === 'production';
const language = process.env.LANGUAGE || 'en-US';
const locale = language.substr(0, language.indexOf('-'));

let rsyncLocation = '';
if (fs.existsSync('scripts/rsync.json')) {
    /* eslint-disable */
    const rsyncConf = require('./rsync.json');
    rsyncLocation = rsyncConf.location;
    /* eslint-enable */
}

/* eslint-disable key-spacing, require-jsdoc */
const config = Object.assign(commonConfig(), {
    entry: {
        annotations: ['./src/BoxAnnotations.ts'],
    },
    // The test page loads annotations.js with a classic script tag, so the
    // webpack-dev-server build inlines deps and emits a non-module file.
    ...(isDevServer
        ? {}
        : {
              externals: [
                  ({ request }, callback) => {
                      if (!request) {
                          return callback();
                      }
                      if (commonjsExternals.some(name => matchesPackage(request, name))) {
                          return callback(null, `commonjs ${request}`);
                      }
                      if (moduleExternals.some(name => matchesPackage(request, name))) {
                          return callback(null, `module ${request}`);
                      }
                      return callback();
                  },
              ],
              experiments: {
                  outputModule: true,
              },
          }),
    output: {
        filename: '[name].js',
        path: path.resolve('dist'),
        ...(isDevServer
            ? {}
            : {
                  library: {
                      type: 'module',
                  },
              }),
    },
    resolve: {
        alias: {
            'box-annotations-locale-data': path.resolve(`./i18n/${language}`),
            'box-elements-messages': path.resolve(`node_modules/box-ui-elements/i18n/${language}`),
            'react-intl-relativetimeformat-locale-data': path.resolve(
                `node_modules/@formatjs/intl-relativetimeformat/dist/locale-data/${locale}`,
            ),
            'react-intl-pluralrules-locale-data': path.resolve(
                `node_modules/@formatjs/intl-pluralrules/dist/locale-data/${locale}`,
            ),
        },
        extensions: ['.tsx', '.ts', '.js'],
        modules: ['src', 'node_modules'],
    },
    devServer: {
        static: './test',
        allowedHosts: 'all',
        host: '0.0.0.0',
        port: 8001,
    },
});

if (isDev) {
    if (rsyncLocation) {
        config.plugins.push(new RsyncPlugin('dist/.', rsyncLocation, 'annotations'));
    }

    config.devtool = isLinked ? 'eval-cheap-module-source-map' : 'source-map';
    config.plugins.push(new TranslationsPlugin());
    config.plugins.push(
        new CircularDependencyPlugin({
            exclude: /node_modules/,
            failOnError: true,
        }),
    );
}

if (isRelease && language === 'en-US') {
    config.optimization = {
        minimizer: ['...', new CssMinimizerPlugin()],
    };

    // Add license message to top of code
    config.plugins.push(new BannerPlugin(license));
}

module.exports = config;
