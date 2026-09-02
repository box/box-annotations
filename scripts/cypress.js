/* eslint-disable no-console */
const axios = require('axios');
const childProcess = require('child_process');

const { argv, env } = process;
const { E2E_ACCESS_TOKEN } = env;
const TEST_PARENT_FOLDER_ID = '118537970832';
const DOCUMENT_TEMPLATE_FILE_ID = '694470903390';
const IMAGE_TEMPLATE_FILE_ID = '694468799644';
const KILL_SIGNALS = [
    'SIGABRT',
    'SIGBUS',
    'SIGFPE',
    'SIGHUP',
    'SIGILL',
    'SIGINT',
    'SIGQUIT',
    'SIGSEGV',
    'SIGTERM',
    'SIGTRAP',
    'SIGUSR1',
    'SIGUSR2',
];

if (!E2E_ACCESS_TOKEN) {
    throw new Error('E2E_ACCESS_TOKEN must be set as an environment variable');
}

const api = axios.create({
    baseURL: 'https://api.box.com/2.0',
    headers: {
        Authorization: `Bearer ${E2E_ACCESS_TOKEN}`,
    },
});

async function cleanup(folderId) {
    console.log('Cleanup test folder and files...');

    try {
        await api.delete(`/folders/${folderId}`, { params: { recursive: true } });
        console.log('Cleanup complete.');
    } catch (error) {
        console.error(`Cleanup failed. Error: ${error.message}`);
    }
}

async function main() {
    const testFolderName = `Test ${new Date().toISOString()}`;

    console.log(`Setup test folder: ${testFolderName}...`);
    const { data: folder } = await api.post('/folders', {
        name: testFolderName,
        parent: { id: TEST_PARENT_FOLDER_ID },
    });
    const { id: folderId } = folder;
    const { data: document } = await api.post(`/files/${DOCUMENT_TEMPLATE_FILE_ID}/copy`, {
        parent: { id: folderId },
    });
    const { data: image } = await api.post(`/files/${IMAGE_TEMPLATE_FILE_ID}/copy`, {
        parent: { id: folderId },
    });
    console.log('Setup complete.');

    KILL_SIGNALS.forEach(signal => process.on(signal, () => cleanup(folderId)));

    try {
        console.log('Cypress run starting...');

        const suffix = argv.indexOf('-o') >= 0 ? 'open' : 'run';
        const result = childProcess.spawnSync('yarn', ['npm-run-all', '-p', '-r', 'start:dev', `cy:${suffix}`], {
            env: {
                ...env,
                CYPRESS_ACCESS_TOKEN: E2E_ACCESS_TOKEN,
                CYPRESS_FILE_ID_DOC: document.id,
                CYPRESS_FILE_ID_IMAGE: image.id,
            },
            stdio: 'inherit',
        });

        if (result.status === 0) {
            console.log('Cypress run SUCCESS.');
        } else {
            console.log('Cypress run FAILURE.');
            process.exitCode = result.status || 1;
        }
    } finally {
        await cleanup(folderId);
    }

    console.log('Test script complete. Exiting.');
}

main();
