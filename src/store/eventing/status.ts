import eventManager from '../../common/EventManager';
import { AppState } from '../types';
import { Event } from '../../@types';
import { getAnnotationMode } from '../common';
import { getCreatorStatus } from '../creator';

export const handleSetStatusAction = (prevState: AppState, nextState: AppState): void => {
    const prevStatus = getCreatorStatus(prevState);
    const nextStatus = getCreatorStatus(nextState);

    if (prevStatus === nextStatus) {
        return;
    }

    eventManager.emit(Event.CREATOR_STATUS_CHANGE, {
        status: nextStatus,
        type: getAnnotationMode(nextState),
    });
};
