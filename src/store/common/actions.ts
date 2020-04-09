import { createAction } from '@reduxjs/toolkit';
import { Mode } from './types';

export const setVisibilityAction = createAction<boolean>('SET_VISIBILITY');
export const toggleAnnotationModeAction = createAction<Mode>('TOGGLE_ANNOTATION_MODE');
