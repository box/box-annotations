import { Action, Dispatch, Middleware, MiddlewareAPI } from '@reduxjs/toolkit';
import { toggleAnnotationModeAction } from '../common/actions';
import handleModeEvents from './modes';
import handleVisibilityEvents from './visibility';
import { setVisibilityAction } from '../common';
import { EventHandlerEntry } from './types';

// Array of event handlers based on redux action. To add handling for new events add an entry keyed by action
const eventHandlers: EventHandlerEntry[] = [
    { [toggleAnnotationModeAction.toString()]: handleModeEvents },
    { [setVisibilityAction.toString()]: handleVisibilityEvents },
];

const eventingMiddleware: Middleware = (store: MiddlewareAPI) => (next: Dispatch) => (action: Action): Action => {
    const { type } = action;
    const prevState = store.getState();
    const result = next(action);
    const nextState = store.getState();

    // Filters the eventHandlers array by the action type and then calls the handler with prevState and nextState
    // to allow it to generate the appropriate events
    eventHandlers
        .filter(handlerEntry => handlerEntry[type])
        .map(handlerEntry => handlerEntry[type])
        .forEach(handler => handler(prevState, nextState));

    return result;
};

export default eventingMiddleware;
