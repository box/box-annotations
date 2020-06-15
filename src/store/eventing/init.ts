import eventManager from '../../common/EventManager';
import { AppState } from '../types';
import { Event } from '../../@types';
import { getAnnotations } from '../annotations';

export const handleAnnotationsInitialized = (prevState: AppState, nextState: AppState): void => {
    eventManager.emit(Event.ANNOTATIONS_INITIALIZED, { annotations: getAnnotations(nextState) });
};
