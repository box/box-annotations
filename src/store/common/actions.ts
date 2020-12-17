import { createAction } from '@reduxjs/toolkit';
import { Mode } from './types';

export const setColorAction = createAction<string>('SET_COLOR');
export const toggleAnnotationModeAction = createAction<Mode>('TOGGLE_ANNOTATION_MODE');
