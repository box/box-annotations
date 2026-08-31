import eventManager from '../../common/EventManager';
import { AppState } from '../types';
import { AsyncAction, Status } from './types';
import { Event } from '../../@types';

const emitDeleteEvent = (action: AsyncAction<string, string>, status: Status): void => {
    const { error, meta: { arg, requestId } = {}, payload } = action;
    if (status === Status.SUCCESS && !payload) return;
    const id = payload ?? arg;
    eventManager.emit(Event.ANNOTATION_DELETE, {
        annotation: id ? { id } : undefined,
        error,
        meta: { requestId, status },
    });
};

const deleteHandler =
    (status: Status) =>
    (_prev: AppState, _next: AppState, action: AsyncAction): void =>
        emitDeleteEvent(action as AsyncAction<string, string>, status);

const handleDeleteErrorEvents = deleteHandler(Status.ERROR);
const handleDeletePendingEvents = deleteHandler(Status.PENDING);
const handleDeleteSuccessEvents = deleteHandler(Status.SUCCESS);

export { handleDeleteErrorEvents, handleDeletePendingEvents, handleDeleteSuccessEvents };
