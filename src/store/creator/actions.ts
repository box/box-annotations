import { createAction } from '@reduxjs/toolkit';
import { CreatorItem, CreatorStatus } from './types';

export const setStagedAction = createAction<CreatorItem | null>('SET_CREATOR_STAGED');
export const setStatusAction = createAction<CreatorStatus>('SET_CREATOR_STATUS');
export const setCursorAction = createAction<number>('SET_CREATOR_CURSOR');
