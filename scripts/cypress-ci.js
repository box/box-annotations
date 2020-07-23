/* eslint-disable no-console */

const BoxSDK = require('box-node-sdk');
const childProcess = require('child_process');

const { env } = process;
const { E2E_ACCESS_TOKEN, E2E_CLIENT_ID, E2E_PARENT_FOLDER_ID } = env;

const sdk = new BoxSDK({
    clientID: E2E_CLIENT_ID,
    clientSecret: 'none',
});

const client = sdk.getBasicClient(E2E_ACCESS_TOKEN);

async function main() {
    const testFolderName = `Test ${new Date().toISOString()}`;

    console.log(`Setup test folder: ${testFolderName}...`);
    const { id: folderId } = await client.folders.create(E2E_PARENT_FOLDER_ID, testFolderName);
    const { id: documentId } = await client.files.copy('694470903390', folderId); // Document template
    const { id: imageId } = await client.files.copy('694468799644', folderId); // Image template
    console.log('Setup complete.');

    try {
        console.log('Cypress run starting...');

        const output = childProcess.execSync(`yarn test:e2e`, {
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

    try {
        console.log('Cleanup test folder and files...');
        await client.folders.delete(folderId, { recursive: true });
        console.log('Cleanup complete.');
    } catch (error) {
        console.error(`Cleanup failed. Error: ${error.message}`);
    }

    console.log('Test script complete. Exiting.');
}

main();
