import eventManager from '../../common/EventManager';
import { AppState } from '../types';
import { getActiveAnnotationId } from '../annotations';
import { Event } from '../../@types';

const handleActiveAnnotationEvents = (prevState: AppState, nextState: AppState): void => {
    const prevActiveAnnotationId = getActiveAnnotationId(prevState);
    const nextActiveAnnotationId = getActiveAnnotationId(nextState);

    if (prevActiveAnnotationId !== nextActiveAnnotationId) {
        eventManager.emit(Event.ACTIVE_CHANGE, nextActiveAnnotationId);
    }
};

export { handleActiveAnnotationEvents };
