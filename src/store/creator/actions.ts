import { createAction } from '@reduxjs/toolkit';
import { CreatorItem, CreatorStatus, SelectionItem } from './types';

export const setCursorAction = createAction<number>('SET_CREATOR_CURSOR');
export const setSelectionAction = createAction<SelectionItem | null>('SET_SELECTION');
export const setMessageAction = createAction<string>('SET_CREATOR_MESSAGE');
export const setStagedAction = createAction<CreatorItem | null>('SET_CREATOR_STAGED');
export const setStatusAction = createAction<CreatorStatus>('SET_CREATOR_STATUS');
