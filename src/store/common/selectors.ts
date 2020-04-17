import { AppState } from '../types';
import { Mode } from './types';

type State = Pick<AppState, 'common'>;

export const getAnnotationMode = ({ common }: State): Mode => common.mode;
export const getVisibility = ({ common }: State): boolean => common.visibility;
