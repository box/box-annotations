import noop from 'lodash/noop';
import { Action, Dispatch, Middleware, MiddlewareAPI } from '@reduxjs/toolkit';
import {
    createAnnotationAction,
    fetchAnnotationsAction,
    setActiveAnnotationIdAction,
    setIsInitialized,
} from '../annotations/actions';
import { EventHandlerMap } from './types';
import { handleActiveAnnotationEvents } from './active';
import { handleAnnotationsInitialized } from './init';
import { handleCreateErrorEvents, handleCreatePendingEvents, handleCreateSuccessEvents } from './create';
import { handleFetchErrorEvents } from './fetch';
import { handleResetCreatorAction, handleSetStagedAction } from './staged';
import { handleToggleAnnotationModeAction } from './mode';
import { toggleAnnotationModeAction } from '../common/actions';
import { setStagedAction, resetCreatorAction } from '../creator';

// Array of event handlers based on redux action. To add handling for new events add an entry keyed by action
const eventHandlers: EventHandlerMap = {
    [createAnnotationAction.fulfilled.toString()]: handleCreateSuccessEvents,
    [createAnnotationAction.pending.toString()]: handleCreatePendingEvents,
    [createAnnotationAction.rejected.toString()]: handleCreateErrorEvents,
    [fetchAnnotationsAction.rejected.toString()]: handleFetchErrorEvents,
    [resetCreatorAction.toString()]: handleResetCreatorAction,
    [setActiveAnnotationIdAction.toString()]: handleActiveAnnotationEvents,
    [setIsInitialized.toString()]: handleAnnotationsInitialized,
    [setStagedAction.toString()]: handleSetStagedAction,
    [toggleAnnotationModeAction.toString()]: handleToggleAnnotationModeAction,
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
