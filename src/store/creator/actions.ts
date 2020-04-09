import { createAction } from '@reduxjs/toolkit';
import { CreatorItem, CreatorStatus } from './types';

export const setStaged = createAction<CreatorItem | null>('SET_CREATOR_STAGED');
export const setStatus = createAction<CreatorStatus>('SET_CREATOR_STATUS');
