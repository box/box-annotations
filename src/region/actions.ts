import { AppThunkDispatch, AppState } from '../store';
import { createAnnotationAction } from '../store/annotations';
import { getFileVersionId } from '../store/options';
import { Rect } from '../@types';
import { TARGET_TYPE } from '../constants';

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
                type: TARGET_TYPE.PAGE,
                value: location,
            },
            shape,
            type: 'region' as const,
        },
    };

    return dispatch(createAnnotationAction(newAnnotation));
};
