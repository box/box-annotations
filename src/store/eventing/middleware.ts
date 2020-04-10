import noop from 'lodash/noop';
import { Action, Dispatch, Middleware, MiddlewareAPI } from '@reduxjs/toolkit';
import { saveAnnotationAction } from '../annotations/actions';
import { handleCreateErrorEvents, handleCreatePendingEvents, handleCreateSuccessEvents } from './create';
import { EventHandler, EventHandlerMap } from '../../@types';

// Array of event handlers based on redux action. To add handling for new events add an entry keyed by action
const eventHandlers: EventHandlerMap = {
    [saveAnnotationAction.pending.toString()]: handleCreatePendingEvents,
    [saveAnnotationAction.fulfilled.toString()]: handleCreateSuccessEvents,
    [saveAnnotationAction.rejected.toString()]: handleCreateErrorEvents,
};

const getEventingMiddleware: Middleware = (handlers?: EventHandlerMap = eventHandlers) => (store: MiddlewareAPI) => (
    next: Dispatch,
) => (action: Action): Action => {
    const { type } = action;
    const prevState = store.getState();
    const result = next(action);
    const nextState = store.getState();

    const handler = handlers[action.type] || noop;
    handler(prevState, nextState, action);

    return result;
};

export default getEventingMiddleware;
