import noop from 'lodash/noop';
import { Action, Dispatch, Middleware, MiddlewareAPI } from '@reduxjs/toolkit';
import {
    createAnnotationAction,
    createReplyAction,
    deleteAnnotationAction,
    deleteReplyAction,
    fetchAnnotationsAction,
    setActiveAnnotationIdAction,
    setIsInitialized,
    updateAnnotationAction,
    updateReplyAction,
} from '../annotations/actions';
import { navigateBoundingBoxHighlightAction } from '../boundingBoxHighlights/actions';
import { EventHandlerMap } from './types';
import { handleActiveAnnotationEvents } from './active';
import { handleAnnotationsInitialized } from './init';
import { handleNavigateBoundingBoxHighlight } from './boundingBoxHighlightNav';
import { handleCreateErrorEvents, handleCreatePendingEvents, handleCreateSuccessEvents } from './create';
import { handleDeleteErrorEvents, handleDeletePendingEvents, handleDeleteSuccessEvents } from './delete';
import { handleFetchErrorEvents } from './fetch';
import { handleToggleAnnotationModeAction } from './mode';
import {
    handleReplyCreateErrorEvents,
    handleReplyCreatePendingEvents,
    handleReplyCreateSuccessEvents,
} from './replyCreate';
import {
    handleReplyDeleteErrorEvents,
    handleReplyDeletePendingEvents,
    handleReplyDeleteSuccessEvents,
} from './replyDelete';
import {
    handleReplyUpdateErrorEvents,
    handleReplyUpdatePendingEvents,
    handleReplyUpdateSuccessEvents,
} from './replyUpdate';
import { handleResetCreatorAction, handleSetStagedAction } from './staged';
import { handleSetStatusAction } from './status';
import { handleUpdateErrorEvents, handleUpdatePendingEvents, handleUpdateSuccessEvents } from './update';
import { resetCreatorAction, setStagedAction, setStatusAction } from '../creator';
import { toggleAnnotationModeAction } from '../common/actions';

export const eventHandlers: EventHandlerMap = {
    [createAnnotationAction.fulfilled.toString()]: handleCreateSuccessEvents,
    [createAnnotationAction.pending.toString()]: handleCreatePendingEvents,
    [createAnnotationAction.rejected.toString()]: handleCreateErrorEvents,
    [createReplyAction.fulfilled.toString()]: handleReplyCreateSuccessEvents,
    [createReplyAction.pending.toString()]: handleReplyCreatePendingEvents,
    [createReplyAction.rejected.toString()]: handleReplyCreateErrorEvents,
    [deleteAnnotationAction.fulfilled.toString()]: handleDeleteSuccessEvents,
    [deleteAnnotationAction.pending.toString()]: handleDeletePendingEvents,
    [deleteAnnotationAction.rejected.toString()]: handleDeleteErrorEvents,
    [deleteReplyAction.fulfilled.toString()]: handleReplyDeleteSuccessEvents,
    [deleteReplyAction.pending.toString()]: handleReplyDeletePendingEvents,
    [deleteReplyAction.rejected.toString()]: handleReplyDeleteErrorEvents,
    [fetchAnnotationsAction.rejected.toString()]: handleFetchErrorEvents,
    [navigateBoundingBoxHighlightAction.toString()]: handleNavigateBoundingBoxHighlight,
    [resetCreatorAction.toString()]: handleResetCreatorAction,
    [setActiveAnnotationIdAction.toString()]: handleActiveAnnotationEvents,
    [setIsInitialized.toString()]: handleAnnotationsInitialized,
    [setStagedAction.toString()]: handleSetStagedAction,
    [setStatusAction.toString()]: handleSetStatusAction,
    [toggleAnnotationModeAction.toString()]: handleToggleAnnotationModeAction,
    [updateAnnotationAction.fulfilled.toString()]: handleUpdateSuccessEvents,
    [updateAnnotationAction.pending.toString()]: handleUpdatePendingEvents,
    [updateAnnotationAction.rejected.toString()]: handleUpdateErrorEvents,
    [updateReplyAction.fulfilled.toString()]: handleReplyUpdateSuccessEvents,
    [updateReplyAction.pending.toString()]: handleReplyUpdatePendingEvents,
    [updateReplyAction.rejected.toString()]: handleReplyUpdateErrorEvents,
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
