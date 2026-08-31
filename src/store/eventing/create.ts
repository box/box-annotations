import eventManager from '../../common/EventManager';
import { AsyncAction, Status } from './types';
import { AppState } from '../types';
import { Annotation, Event, NewAnnotation } from '../../@types';

const emitCreateEvent = (action: AsyncAction<NewAnnotation, Annotation>, status: Status): void => {
    const { error, meta: { arg, requestId } = {}, payload } = action;
    eventManager.emit(Event.ANNOTATION_CREATE, {
        annotation: payload || arg,
        error,
        meta: {
            requestId,
            status,
        },
    });
};

const createHandler =
    (status: Status) =>
    (prevState: AppState, nextState: AppState, action: AsyncAction): void =>
        emitCreateEvent(action as AsyncAction<NewAnnotation, Annotation>, status);

const handleCreateErrorEvents = createHandler(Status.ERROR);
const handleCreatePendingEvents = createHandler(Status.PENDING);
const handleCreateSuccessEvents = createHandler(Status.SUCCESS);

export { handleCreateErrorEvents, handleCreatePendingEvents, handleCreateSuccessEvents };
