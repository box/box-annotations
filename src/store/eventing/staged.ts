import eventManager from '../../common/EventManager';
import { AppState } from '../types';
import { getCreatorStaged, CreatorItem, isCreatorStagedRegion, isCreatorStagedHighlight } from '../creator';
import { Event } from '../../@types';

type Status = 'create' | 'update' | 'cancel';

type Type = 'highlight' | 'region';

type StagedChangeEvent = {
    status: Status;
    type: Type;
};

const getStatus = (prevStaged: CreatorItem, nextStaged: CreatorItem): Status | null => {
    let status: Status | null = null;

    if (prevStaged === null && nextStaged !== null) {
        status = 'create';
    }

    if (prevStaged !== null && nextStaged !== null) {
        status = 'update';
    }

    return status;
};

const getType = (staged: CreatorItem): Type | null => {
    let type: Type | null = null;

    if (isCreatorStagedRegion(staged)) {
        type = 'region';
    }

    if (isCreatorStagedHighlight(staged)) {
        type = 'highlight';
    }

    return type;
};

export const handleSetStagedAction = (prevState: AppState, nextState: AppState): void => {
    const prevStaged = getCreatorStaged(prevState);
    const nextStaged = getCreatorStaged(nextState);
    const status = getStatus(prevStaged, nextStaged);
    const type = getType(prevStaged) || getType(nextStaged);

    if (!status || !type) {
        return;
    }

    const payload: StagedChangeEvent = { type, status };
    eventManager.emit(Event.ANNOTATIONS_STAGED_CHANGE, payload);
};

export const handleResetCreatorAction = (prevState: AppState): void => {
    const prevStaged = getCreatorStaged(prevState);
    const type = getType(prevStaged);

    if (!type) {
        return;
    }

    const payload: StagedChangeEvent = { type, status: 'cancel' };

    eventManager.emit(Event.ANNOTATIONS_STAGED_CHANGE, payload);
};
