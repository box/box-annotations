import { toggleAnnotationModeAction } from './actions';
import eventManager from '../../common/EventManager';
import { getAnnotationMode } from './selectors';
import { Mode } from './types';

const eventingMiddleware = store => next => action => {
    const state = store.getState();
    const result = next(action);

    const { type } = action;

    if (type === toggleAnnotationModeAction.toString()) {
        const nextState = store.getState();
        const nextMode = getAnnotationMode(nextState);
        const prevMode = getAnnotationMode(state);
        const hasModeExited = prevMode !== Mode.NONE && prevMode !== nextMode;
        const hasModeEntered = nextMode !== Mode.NONE;

        if (hasModeExited) {
            eventManager.emit('annotationmodeexit', { mode: prevMode });
        }

        if (hasModeEntered) {
            eventManager.emit('annotatiomodeenter', { mode: nextMode });
        }
    }

    return result;
};

export default eventingMiddleware;
