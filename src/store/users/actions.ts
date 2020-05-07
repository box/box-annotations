import { createAsyncThunk } from '@reduxjs/toolkit';
import { APICollection } from '../../api';
import { AppThunkAPI } from '../types';
import { Collaborator } from '../../@types';
import { getFileId } from '../options';

export const fetchCollaboratorsAction = createAsyncThunk<APICollection<Collaborator>, undefined, AppThunkAPI>(
    'FETCH_COLLABORATORS',
    async (arg, { extra, getState, signal }) => {
        // Create a new client for each request
        const client = extra.api.getCollaboratorsAPI();
        const state = getState();
        const fileId = getFileId(state);

        // Destroy the client if action's abort method is invoked
        signal.addEventListener('abort', () => {
            client.destroy();
        });

        // Wrap the client request in a promise to allow it to be returned and cancelled
        return new Promise<APICollection<Collaborator>>((resolve, reject) => {
            client.getFileCollaborators(fileId, resolve, reject, {
                include_groups: false, // eslint-disable-line @typescript-eslint/camelcase
                include_uploader_collabs: false, // eslint-disable-line @typescript-eslint/camelcase
            });
        });
    },
);
