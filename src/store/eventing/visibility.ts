import eventManager from '../../common/EventManager';
import { getVisibility } from '../common/selectors';
import { ApplicationState } from '../types';

export default function handleVisibilityEvents(prevState: ApplicationState, nextState: ApplicationState): void {
    const nextVisibility = getVisibility(nextState);
    const prevVisibility = getVisibility(prevState);
    const hasVisibilityChanged = prevVisibility !== nextVisibility;

    if (hasVisibilityChanged) {
        eventManager.emit('annotationvisibility', { visibility: nextVisibility });
    }
}
