import eventManager from '../../common/EventManager';
import { Annotation , Event } from '../../@types';
import { AppState } from '../types';
import { AsyncAction, Status } from './types';

type UpdateArg = { annotationId: string; payload: { message?: string; status?: string } };

const emitUpdateEvent = (action: AsyncAction<UpdateArg, Annotation>, status: Status): void => {
    const { error, meta: { arg, requestId } = {}, payload } = action;
    if (status === Status.SUCCESS && !payload) return;
    const annotation = payload ?? (arg ? { id: arg.annotationId } : undefined);
    eventManager.emit(Event.ANNOTATION_UPDATE, {
        annotation,
        error,
        meta: { requestId, status },
    });
};

const updateHandler = (status: Status) => (
    _prev: AppState,
    _next: AppState,
    action: AsyncAction,
): void => emitUpdateEvent(action as AsyncAction<UpdateArg, Annotation>, status);

const handleUpdateErrorEvents = updateHandler(Status.ERROR);
const handleUpdatePendingEvents = updateHandler(Status.PENDING);
const handleUpdateSuccessEvents = updateHandler(Status.SUCCESS);

export { handleUpdateErrorEvents, handleUpdatePendingEvents, handleUpdateSuccessEvents };
