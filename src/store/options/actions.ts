import { createAction } from '@reduxjs/toolkit';
import { Permissions } from '../../@types';

export const setFileIdAction = createAction<string | null>('SET_FIlE_ID');
export const setFileVersionIdAction = createAction<string | null>('SET_FILE_VERSION_ID');
export const setPermissionsAction = createAction<Permissions>('SET_PERMISSIONS');
