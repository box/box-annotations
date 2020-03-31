import { createAction } from '@reduxjs/toolkit';
import { TOGGLE_ANNOTATION_MODE, ModeTypes } from './types';

const toggleAnnotationModeAction = createAction<ModeTypes>(TOGGLE_ANNOTATION_MODE);

export default toggleAnnotationModeAction;
