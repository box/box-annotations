import { createAction } from '@reduxjs/toolkit';
import { Permissions } from '../../@types';

export const setDocumentFtuxCursorDisabledAction = createAction('SET_DOCUMENT_FTUX_CURSOR_DISABLED');
export const setFileIdAction = createAction<string | null>('SET_FIlE_ID');
export const setFileVersionIdAction = createAction<string | null>('SET_FILE_VERSION_ID');
export const setImageFtuxCursorDisabledAction = createAction('SET_IMAGE_FTUX_CURSOR_DISABLED');
export const setPermissionsAction = createAction<Permissions>('SET_PERMISSIONS');
export const setRotationAction = createAction<number>('SET_ROTATION');
export const setScaleAction = createAction<number>('SET_SCALE');
