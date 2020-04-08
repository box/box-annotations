import { createAction } from '@reduxjs/toolkit';
import { TOGGLE_ANNOTATION_VISIBILITY } from './types';

const toggleAnnotationVisibilityAction = createAction(TOGGLE_ANNOTATION_VISIBILITY);

// eslint-disable-next-line import/prefer-default-export
export { toggleAnnotationVisibilityAction };
