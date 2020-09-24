import { createAction } from '@reduxjs/toolkit';
import { CreatorItem, CreatorStatus } from './types';
import { Shape } from '../../@types';

export const resetCreatorAction = createAction('RESET_CREATOR');
export const setCursorAction = createAction<number>('SET_CREATOR_CURSOR');
export const setMessageAction = createAction<string>('SET_CREATOR_MESSAGE');
export const setReferenceShapeAction = createAction<Shape | undefined>('SET_REFERENCE_SHAPE');
export const setStagedAction = createAction<CreatorItem | null>('SET_CREATOR_STAGED');
export const setStatusAction = createAction<CreatorStatus>('SET_CREATOR_STATUS');
