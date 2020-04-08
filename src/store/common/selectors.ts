import { ApplicationState } from '../types';
import { Mode } from './types';

type State = Pick<ApplicationState, 'common'>;

export const getAnnotationMode = ({ common }: State): Mode => common.mode;
export const getAnnotationVisibility = ({ common }: State): boolean => common.visibility;
