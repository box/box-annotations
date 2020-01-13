const workerFarm = require('worker-farm');
const locales = require('@box/languages');
const numCPUs = require('os').cpus().length;
const { execSync } = require('child_process');
const path = require('path');

const filename = path.basename(__filename);
const bundleCount = locales.length * 2; // One with react, and one without

let counter = 0;
const workers = workerFarm(
    {
        maxConcurrentWorkers: numCPUs - 2,
        maxRetries: 0,
    },
    require.resolve('./build_locale.js'),
);

/* eslint-disable */
locales.forEach(locale => {
    workers(locale, error => {
        if (++counter === bundleCount || error) {
            // terminate after all locales have been processed
            workerFarm.end(workers);
        }

        if (error) {
            // kill the node process that spawns the workers as well as all processes been spawned
            execSync(`ps ax | grep "${filename}" | cut -b1-06 | xargs -t kill`);
        }
    });
});
/* eslint-enable */
