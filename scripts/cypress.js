/* eslint-disable no-console */
const BoxSDK = require('box-node-sdk');
const childProcess = require('child_process');

const { argv, env } = process;
const { E2E_ACCESS_TOKEN, E2E_CLIENT_ID } = env;
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

if (!E2E_CLIENT_ID) {
    throw new Error('E2E_CLIENT_ID must be set as an environment variable');
}

const sdk = new BoxSDK({
    clientID: E2E_CLIENT_ID,
    clientSecret: 'none',
});

const client = sdk.getBasicClient(E2E_ACCESS_TOKEN);

async function cleanup(folderId) {
    console.log('Cleanup test folder and files...');

    try {
        await client.folders.delete(folderId, { recursive: true });
        console.log('Cleanup complete.');
    } catch (error) {
        console.error(`Cleanup failed. Error: ${error.message}`);
    }
}

async function main() {
    const testFolderName = `Test ${new Date().toISOString()}`;

    // Bootstrap the test folder and copy template files into it
    console.log(`Setup test folder: ${testFolderName}...`);
    const { id: folderId } = await client.folders.create('118537970832', testFolderName); // Test folder
    const { id: documentId } = await client.files.copy('694470903390', folderId); // Document template
    const { id: imageId } = await client.files.copy('694468799644', folderId); // Image template
    console.log('Setup complete.');

    // Attempt to cleanup test folder before script is killed (example: CTL+C)
    KILL_SIGNALS.forEach(signal => process.on(signal, () => cleanup(folderId)));

    try {
        console.log('Cypress run starting...');

        const suffix = argv.indexOf('-o') >= 0 ? 'open' : 'run'; // Pass -o to run Cypress in "open" mode
        const output = childProcess.execSync(`yarn npm-run-all -p -r start:dev cy:${suffix}`, {
            env: {
                ...env,
                CYPRESS_ACCESS_TOKEN: E2E_ACCESS_TOKEN,
                CYPRESS_FILE_ID_DOC: documentId,
                CYPRESS_FILE_ID_IMAGE: imageId,
            },
        });

        console.log('Cypress run SUCCESS. Output:');
        console.log('------------------------------');
        console.log(output.toString());
    } catch (error) {
        console.log('Cypress run FAILURE. Output:');
        console.log('------------------------------');
        console.log(error.stdout.toString());
        process.exitCode = error && error.status ? error.status : 0;
    }

    await cleanup(folderId);

    console.log('Test script complete. Exiting.');
}

main();
