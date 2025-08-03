import { AppThunkDispatch, AppState, getCreatorStatus, CreatorStatus } from '../store';
import { createAnnotationAction } from '../store/annotations';
import { getFileVersionId } from '../store/options';
import { PathGroup } from '../@types';
import { FRAME, PAGE } from '../constants';
import { resetDrawingAction, setDrawingLocationAction } from '../store/drawing';

export type CreateArg = {
    location: number;
    message: string;
    pathGroups: Array<PathGroup>;
    targetType: typeof PAGE | typeof FRAME;
};

export const createDrawingAction = (arg: CreateArg) => (dispatch: AppThunkDispatch, getState: () => AppState) => {
    const { location, message, pathGroups, targetType } = arg;
    const state = getState();
    const newAnnotation = {
        description: {
            message,
            type: 'reply' as const,
        },
        file_version: {
            id: getFileVersionId(state),
        },
        target: {
            location: {
                type: targetType,
                value: location,
            },
            path_groups: pathGroups,
            type: 'drawing' as const,
        },
    };


    return dispatch(createAnnotationAction(newAnnotation));
};

export const setupDrawingAction = (location: number) => (dispatch: AppThunkDispatch, getState: () => AppState) => {
    const state = getState();
    const creatorStatus = getCreatorStatus(state);

    if (creatorStatus === CreatorStatus.staged) {
        dispatch(resetDrawingAction());
    }

    return dispatch(setDrawingLocationAction(location));
};
