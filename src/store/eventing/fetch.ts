import eventManager from '../../common/EventManager';
import { AppState } from '../types';
import { AsyncAction } from './types';
import { Event } from '../../@types';

export const handleFetchErrorEvents = (prevState: AppState, nextState: AppState, action: AsyncAction): void => {
    if (action.meta?.aborted) {
        return;
    }
    eventManager.emit(Event.ANNOTATION_FETCH_ERROR, action);
};
