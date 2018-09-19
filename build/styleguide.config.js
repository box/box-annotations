const path = require('path');
const { version } = require('../package.json');
const webpackConf = require('./styleguide.webpack.config.js');

module.exports = {
    webpackConfig: Array.isArray(webpackConf) ? webpackConf[0] : webpackConf,
    styleguideDir: path.join(__dirname, '../styleguide'),
    // @NOTE (wyu): This is how you enable source-map for styleguidist
    dangerouslyUpdateWebpackConfig(webpackConfig) {
        webpackConfig.devtool = 'source-map';
        return webpackConfig;
    },
    sections: [
        {
            name: 'Components',
            components: '../src/components/**/[A-Z]*.js'
        }
    ],
    title: `Box Annotations ${version}`,
    theme: {
        color: {
            link: '#777',
            linkHover: '#0061d5'
        },
        fontFamily: {
            base: 'Lato, "Helvetica Neue", Helvetica, Arial, sans-serif'
        }
    },
    pagePerSection: true
};
