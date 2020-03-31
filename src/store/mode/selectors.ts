import { ModeTypes } from './types';
import { ApplicationState } from '../types';

const getAnnotationMode = (state: ApplicationState): ModeTypes => state.mode;

export default getAnnotationMode;
