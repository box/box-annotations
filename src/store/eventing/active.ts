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

// eslint-disable-next-line import/prefer-default-export
export { handleActiveAnnotationEvents };
