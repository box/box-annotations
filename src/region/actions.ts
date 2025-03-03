import { AppThunkDispatch, AppState } from '../store';
import { createAnnotationAction } from '../store/annotations';
import { getFileVersionId } from '../store/options';
import { Rect } from '../@types';

export type CreateArg = {
    location: number;
    message: string;
    shape: Rect;
};

export const createRegionAction = (arg: CreateArg) => (dispatch: AppThunkDispatch, getState: () => AppState) => {
    const { location, message, shape } = arg;
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
                type: 'page' as const,
                value: location,
            },
            shape,
            type: 'region' as const,
        },
    };

    return dispatch(createAnnotationAction(newAnnotation));
};
