import noop from 'lodash/noop';
import { Action, Dispatch, Middleware, MiddlewareAPI } from '@reduxjs/toolkit';
import {
    createAnnotationAction,
    fetchAnnotationsAction,
    setActiveAnnotationIdAction,
    setAnnotationsInitialized,
} from '../annotations/actions';
import { handleActiveAnnotationEvents } from './active';
import { handleCreateErrorEvents, handleCreatePendingEvents, handleCreateSuccessEvents } from './create';
import { handleFetchErrorEvents } from './fetch';
import { handleAnnotationsInitialized } from './init';
import { EventHandlerMap } from './types';

// Array of event handlers based on redux action. To add handling for new events add an entry keyed by action
const eventHandlers: EventHandlerMap = {
    [createAnnotationAction.fulfilled.toString()]: handleCreateSuccessEvents,
    [createAnnotationAction.pending.toString()]: handleCreatePendingEvents,
    [createAnnotationAction.rejected.toString()]: handleCreateErrorEvents,
    [fetchAnnotationsAction.rejected.toString()]: handleFetchErrorEvents,
    [setActiveAnnotationIdAction.toString()]: handleActiveAnnotationEvents,
    [setAnnotationsInitialized.toString()]: handleAnnotationsInitialized,
};

function getEventingMiddleware(handlers: EventHandlerMap = eventHandlers): Middleware {
    return (store: MiddlewareAPI) => (next: Dispatch) => (action: Action): Action => {
        const { type } = action;
        // Retrieve the prevState as well as the nextState after the action has modified the state in order
        // to pass all that information to the event handler
        const prevState = store.getState();
        const result = next(action);
        const nextState = store.getState();

        const handler = handlers[type] || noop;
        handler(prevState, nextState, action);

        return result;
    };
}

export default getEventingMiddleware;
