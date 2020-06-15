import getProp from 'lodash/get';
import { Annotation } from '../../@types';
import { AppState } from '../types';

type State = Pick<AppState, 'annotations'>;

export const areAnnotationsInitialized = ({ annotations }: State): boolean => annotations.isInitialized;
export const getActiveAnnotationId = ({ annotations }: State): string | null => annotations.activeId;
export const getAnnotation = ({ annotations }: State, id: string): Annotation | undefined => annotations.byId[id];
export const getAnnotations = ({ annotations }: State): Annotation[] => [...Object.values(annotations.byId)];
export const getAnnotationsForLocation = (state: State, location: number): Annotation[] =>
    getAnnotations(state).filter(annotation => getProp(annotation, 'target.location.value') === location);
