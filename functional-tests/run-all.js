#!/usr/bin/env node

/* eslint-disable no-console */
const async = require('async');
const util = require('util');
const colors = require('colors');
const exec = util.promisify(require('child_process').exec);

const { SAUCE_USERNAME, SAUCE_ACCESS_KEY, TRAVIS_JOB_NUMBER } = process.env;

// browsers
const CHROME = 'chrome';
const FIREFOX = 'firefox';
const EDGE = 'MicrosoftEdge';
const IE = 'internet explorer';

// platforms
const SAFARI = 'Safari';
const WINDOWS = 'Windows 10';
const OSX = 'macOS 10.13';
const ios = 'iOS';
const android = 'Android';

// file information
const CHROME_FILE = {
    id: '285567874839',
    version: '300496591287'
};
const SAFARI_FILE = {
    id: '285569765346',
    version: '300498497346'
};
const FIREFOX_FILE = {
    id: '285568802145',
    version: '300497533713'
};
const EDGE_FILE = {
    id: '285567976309',
    version: '300496707445'
};
const IE_FILE = {
    id: '285568624824',
    version: '300497342136'
};

const envArr = [
    `BROWSER_PLATFORM="${OSX}" BROWSER_NAME="${CHROME}" FILE_ID="${CHROME_FILE.id}" FILE_VERSION_ID="${CHROME_FILE.version}"`,
    `BROWSER_PLATFORM="${OSX}" BROWSER_NAME="safari" FILE_ID="${SAFARI_FILE.id}" FILE_VERSION_ID="${SAFARI_FILE.version}"`,
    `BROWSER_PLATFORM="${OSX}" BROWSER_NAME="${FIREFOX}" FILE_ID="${FIREFOX_FILE.id}" FILE_VERSION_ID="${FIREFOX_FILE.version}"`,
    `BROWSER_PLATFORM="${WINDOWS}" BROWSER_NAME="${EDGE}" FILE_ID="${EDGE_FILE.id}" FILE_VERSION_ID="${EDGE_FILE.version}"`,
    `BROWSER_PLATFORM="${WINDOWS}" BROWSER_NAME="internet explorer" FILE_ID="${IE_FILE.id}" FILE_VERSION_ID="${IE_FILE.version}"`,
    `BROWSER_PLATFORM="${ios}" DEVICE_NAME="iPhone 6 Simulator" PLATFORM_VERSION="11.2" BROWSER_NAME="${SAFARI}" FILE_ID="${SAFARI_FILE.id}" FILE_VERSION_ID="${SAFARI_FILE.version}"`,
    `BROWSER_PLATFORM="${ios}" DEVICE_NAME="iPad Simulator" PLATFORM_VERSION="11.2" BROWSER_NAME="${SAFARI}" FILE_ID="${FIREFOX_FILE.id}" FILE_VERSION_ID="${FIREFOX_FILE.version}"`,
    `BROWSER_PLATFORM="${android}" DEVICE_NAME="Android GoogleAPI Emulator" PLATFORM_VERSION="7.1" BROWSER_NAME="Chrome" FILE_ID="${CHROME_FILE.id}" FILE_VERSION_ID="${CHROME_FILE.version}"`
];

if (!TRAVIS_JOB_NUMBER || !SAUCE_USERNAME || !TRAVIS_JOB_NUMBER) {
    throw new Error('missing TRAVIS_JOB_NUMBER, SAUCE_USERNAME, or TRAVIS_JOB_NUMBER');
}

const processArr = [];
async.eachLimit(
    envArr,
    4,
    async (envStr) => {
        let grepStr = '';

        const mobileRegex = /iOS|Android/;

        if (mobileRegex.test(envStr)) {
            grepStr = '--grep "@mobile"';
        } else {
            grepStr = '--grep "@desktop"';
        }

        const cmd = `cd .. && CI=true SAUCE_USERNAME=${SAUCE_USERNAME} SAUCE_ACCESS_KEY=${SAUCE_ACCESS_KEY} TRAVIS_JOB_NUMBER=${TRAVIS_JOB_NUMBER} ${envStr} node ./node_modules/codeceptjs/bin/codecept.js run --steps ${grepStr}`;

        console.log('Running cmd: ', cmd);
        const process = exec(cmd);
        processArr.push(process);
        await process;
    },
    (err) => {
        if (err) {
            console.log(colors.red.underline(err));
            console.log(colors.red(err.stdout));
            processArr.forEach((process) => {
                if (process && process.kill) {
                    try {
                        process.kill();
                    } catch (err2) {
                        console.error(err2);
                    }
                }
            });
            throw new Error();
        }
        console.log('SUCCESS!');
    }
);
