import { AppThunkDispatch, AppState } from '../store';
import { createAnnotationAction } from '../store/annotations';
import { getFileVersionId } from '../store/options';
import { Rect } from '../@types';
import { TARGET_TYPE } from '../constants';

export type CreateArg = {
    location: number;
    message: string;
    shape: Rect;
    targetType: TARGET_TYPE;
};

export const createRegionAction = (arg: CreateArg) => (dispatch: AppThunkDispatch, getState: () => AppState) => {
    const { location, message, shape, targetType } = arg;
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
            shape,
            type: 'region' as const,
        },
    };

    return dispatch(createAnnotationAction(newAnnotation));
};
