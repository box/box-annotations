// This is used to auto-prefix CSS, see: https://github.com/postcss/postcss-loader
const autoprefixer = require('autoprefixer'); // eslint-disable-line

module.exports = {
    plugins: [autoprefixer()],
};
