import eventManager from '../../common/EventManager';
import { AsyncAction, Event, Status } from './types';
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

const createHandler = (status: Status) => (
    prevState: ApplicationState,
    nextState: ApplicationState,
    action: AsyncAction,
): void => emitCreateEvent(action, status);

const handleCreateErrorEvents = createHandler(Status.ERROR);
const handleCreatePendingEvents = createHandler(Status.PENDING);
const handleCreateSuccessEvents = createHandler(Status.SUCCESS);

export { handleCreateErrorEvents, handleCreatePendingEvents, handleCreateSuccessEvents };
