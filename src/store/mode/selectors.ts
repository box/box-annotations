import { Mode } from './types';
import { ApplicationState } from '../types';

const getAnnotationMode = (state: ApplicationState): Mode => state.mode.current;

export default getAnnotationMode;
