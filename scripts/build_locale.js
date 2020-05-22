const { execSync } = require('child_process');

/**
 * Build a single locale
 *
 * @param {string} locale - locale to build
 * @param {*} callback - callback from worker-farm master process
 * @return {void}
 */
module.exports = (locale = 'en-US', callback) => {
    try {
        console.log(`Building ${locale}`); // eslint-disable-line
        // build assets for a single locale
        execSync(`time LANGUAGE=${locale} yarn build:prod:dist`);
        callback();
    } catch (error) {
        console.error(`Error: Failed to build ${locale}`); // eslint-disable-line
        callback(true);
    }
};
