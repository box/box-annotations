import eventManager from '../../common/EventManager';
import { getAnnotationMode } from '../common/selectors';
import { ApplicationState } from '../types';
import { Mode } from '../common/types';

export default function handleModeEvents(prevState: ApplicationState, nextState: ApplicationState): void {
    const nextMode = getAnnotationMode(nextState);
    const prevMode = getAnnotationMode(prevState);
    const hasModeExited = prevMode !== Mode.NONE && prevMode !== nextMode;
    const hasModeEntered = nextMode !== Mode.NONE;

    if (hasModeExited) {
        eventManager.emit('annotationmodeexit', { mode: prevMode });
    }

    if (hasModeEntered) {
        eventManager.emit('annotationmodeenter', { mode: nextMode });
    }
}
