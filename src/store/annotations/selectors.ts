import getProp from 'lodash/get';
import { Annotation } from '../../@types';
import { ApplicationState } from '../types';

type State = Pick<ApplicationState, 'annotations'>;

export const getAnnotation = ({ annotations }: State, id: string): Annotation | undefined => annotations.byId[id];
export const getAnnotations = ({ annotations }: State): Annotation[] => [...Object.values(annotations.byId)];
export const getAnnotationsForLocation = (state: State, location: number): Annotation[] =>
    getAnnotations(state).filter(annotation => getProp(annotation, 'target.location.value') === location);
