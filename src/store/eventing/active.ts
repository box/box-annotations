import eventManager from '../../common/EventManager';
import { AppState } from '../types';
import { Event } from '../../@types';
import { getActiveAnnotationId } from '../annotations';
import { getFileVersionId } from '../options';

const handleActiveAnnotationEvents = (prevState: AppState, nextState: AppState): void => {
    const prevActiveAnnotationId = getActiveAnnotationId(prevState);
    const nextActiveAnnotationId = getActiveAnnotationId(nextState);
    const fileVersionId = getFileVersionId(nextState);

    if (prevActiveAnnotationId !== nextActiveAnnotationId) {
        eventManager.emit(Event.ACTIVE_CHANGE, { annotationId: nextActiveAnnotationId, fileVersionId });
    }
};

export { handleActiveAnnotationEvents };
