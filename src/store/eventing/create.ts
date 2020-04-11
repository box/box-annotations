import eventManager from '../../common/EventManager';
import { AsyncAction, Event, Status } from '../../@types';
import { ApplicationState } from '../types';

const emitCreateEvent = (action: AsyncAction, status: Status): void => {
    const { error, meta: { arg: annotation } = {} } = action;
    eventManager.emit(Event.CREATE_ANNOTATION, {
        annotation,
        error,
        meta: {
            status,
        },
    });
};

const handleCreateErrorEvents = (
    prevState: ApplicationState,
    nextState: ApplicationState,
    action: AsyncAction,
): void => {
    emitCreateEvent(action, Status.ERROR);
};

const handleCreatePendingEvents = (
    prevState: ApplicationState,
    nextState: ApplicationState,
    action: AsyncAction,
): void => {
    emitCreateEvent(action, Status.PENDING);
};

const handleCreateSuccessEvents = (
    prevState: ApplicationState,
    nextState: ApplicationState,
    action: AsyncAction,
): void => {
    emitCreateEvent(action, Status.SUCCESS);
};

export { handleCreateErrorEvents, handleCreatePendingEvents, handleCreateSuccessEvents };
