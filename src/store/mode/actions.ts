import { createAction } from '@reduxjs/toolkit';
import { TOGGLE_ANNOTATION_MODE, Mode } from './types';

const toggleAnnotationModeAction = createAction<Mode>(TOGGLE_ANNOTATION_MODE);

// eslint-disable-next-line import/prefer-default-export
export { toggleAnnotationModeAction };
