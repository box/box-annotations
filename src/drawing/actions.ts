import { AppThunkDispatch, AppState, getCreatorStatus, CreatorStatus } from '../store';
import { createAnnotationAction } from '../store/annotations';
import { getFileVersionId } from '../store/options';
import { PathGroup } from '../@types';
import { resetDrawingAction, setDrawingLocationAction } from '../store/drawing';

export type CreateArg = {
    location: number;
    message: string;
    pathGroups: Array<PathGroup>;
};

export const createDrawingAction = (arg: CreateArg) => (dispatch: AppThunkDispatch, getState: () => AppState) => {
    const { location, message, pathGroups } = arg;
    const state = getState();
    const newAnnotation = {
        description: {
            message,
            type: 'reply' as const,
        },
        // eslint-disable-next-line @typescript-eslint/camelcase
        file_version: {
            id: getFileVersionId(state),
        },
        target: {
            location: {
                type: 'page' as const,
                value: location,
            },
            // eslint-disable-next-line @typescript-eslint/camelcase
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
