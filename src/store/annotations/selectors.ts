import getProp from 'lodash/get';
import { Annotation } from '../../@types';
import { AppState } from '../types';
import { MEDIA_LOCATION_INDEX } from '../../constants';

type State = Pick<AppState, 'annotations'>;

export const getActiveAnnotationId = ({ annotations }: State): string | null => annotations.activeId;
export const getAnnotation = ({ annotations }: State, id: string): Annotation | undefined => annotations.byId[id];
export const getAnnotations = ({ annotations }: State): Annotation[] => [...Object.values(annotations.byId)];
export const getAnnotationsForLocation = (state: State, location: number): Annotation[] => {
    const annotations = getAnnotations(state);
    // For video annotations the location will be -1 by default as there is no page number for videos. We will return all of the annotations
    // and the component will filter them by the current play time of the video.
    if (location === MEDIA_LOCATION_INDEX) {
        return annotations;
    }
    return annotations.filter(annotation => getProp(annotation, 'target.location.value') === location);
};
export const getIsInitialized = ({ annotations }: State): boolean => annotations.isInitialized;
