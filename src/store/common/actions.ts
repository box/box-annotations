import { createAction } from '@reduxjs/toolkit';
import { TOGGLE_ANNOTATION_VISIBILITY, TOGGLE_ANNOTATION_MODE, Mode } from './types';

export const toggleAnnotationVisibilityAction = createAction(TOGGLE_ANNOTATION_VISIBILITY);
export const toggleAnnotationModeAction = createAction<Mode>(TOGGLE_ANNOTATION_MODE);
