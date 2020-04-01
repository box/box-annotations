import { Mode } from './types';
import { ApplicationState } from '../types';

const getAnnotationMode = (state: ApplicationState): Mode => state.mode.current;

// eslint-disable-next-line import/prefer-default-export
export { getAnnotationMode };
