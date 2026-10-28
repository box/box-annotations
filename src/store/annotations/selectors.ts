import getProp from 'lodash/get';
import { Annotation } from '../../@types';
import { AppState } from '../types';
import { MEDIA_LOCATION_INDEX } from '../../constants';

type State = Pick<AppState, 'annotations'> & {
    options?: {
        showResolved?: boolean;
    };
};

// Hosts that never send the activity-feed filter leave this unset, which keeps resolved marks visible.
const shouldShowResolved = (state: State): boolean => state.options?.showResolved !== false;

const omitHiddenResolved = (state: State, annotations: Annotation[]): Annotation[] => {
    if (shouldShowResolved(state)) {
        return annotations;
    }
    return annotations.filter(annotation => annotation.status !== 'resolved');
};

export const getActiveAnnotationId = ({ annotations }: State): string | null => annotations.activeId;
export const getAnnotation = ({ annotations }: State, id: string): Annotation | undefined => annotations.byId[id];
export const getAnnotations = ({ annotations }: State): Annotation[] => [...Object.values(annotations.byId)];
export const getAnnotationsForLocation = (state: State, location: number): Annotation[] => {
    const annotations = getAnnotations(state);
    // For video annotations the location will be -1 by default as there is no page number for videos. We will return all of the annotations
    // and the component will filter them by the current play time of the video.
    const located =
        location === MEDIA_LOCATION_INDEX
            ? annotations
            : annotations.filter(annotation => getProp(annotation, 'target.location.value') === location);
    return omitHiddenResolved(state, located);
};

export const getVisibleActiveAnnotationId = (state: State): string | null => {
    const activeId = getActiveAnnotationId(state);
    if (!activeId || shouldShowResolved(state)) {
        return activeId;
    }
    const annotation = getAnnotation(state, activeId);
    return annotation?.status === 'resolved' ? null : activeId;
};

export const getIsInitialized = ({ annotations }: State): boolean => annotations.isInitialized;
