import eventManager from '../../common/EventManager';
import { AppState } from '../types';
import { Event } from '../../@types';
import { getAnnotations, getIsInitialized } from '../annotations';

export const handleAnnotationsInitialized = (prevState: AppState, nextState: AppState): void => {
    const prevIsInitialized = getIsInitialized(prevState);
    const nextIsInitialized = getIsInitialized(nextState);

    // Only emit an event the first time the library is initialized/rendered
    if (prevIsInitialized !== nextIsInitialized && nextIsInitialized) {
        eventManager.emit(Event.ANNOTATIONS_INITIALIZED, { annotations: getAnnotations(nextState) });
    }
};
