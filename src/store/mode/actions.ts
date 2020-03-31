import { createAction } from 'redux-actions';
import { TOGGLE_ANNOTATION_MODE } from './types';

const toggleAnnotationModeAction = createAction(TOGGLE_ANNOTATION_MODE);

export default toggleAnnotationModeAction;
