import eventManager from '../../common/EventManager';
import { AppState } from '../types';
import { Event } from '../../@types';

export const handleToggleAnnotationModeAction = (prevState: AppState, nextState: AppState): void => {
    eventManager.emit(Event.ANNOTATIONS_MODE_CHANGE, nextState.common.mode);
};
