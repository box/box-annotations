import { createAction } from '@reduxjs/toolkit';

export const setFileIdAction = createAction<string | null>('SET_FIlE_ID');
export const setFileVersionIdAction = createAction<string | null>('SET_FILE_VERSION_ID');
