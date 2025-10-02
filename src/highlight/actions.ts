import { AppThunkDispatch, AppState } from '../store';
import { createAnnotationAction } from '../store/annotations';
import { getFileVersionId } from '../store/options';
import { Rect } from '../@types';
import { TARGET_TYPE } from '../constants';

export type CreateArg = {
    location: number;
    message: string;
    shapes: Rect[];
    text?: string;
};

export const createHighlightAction = (arg: CreateArg) => (dispatch: AppThunkDispatch, getState: () => AppState) => {
    const { location, message, shapes } = arg;
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
                type: TARGET_TYPE.PAGE as const,
                value: location,
            },
            shapes,
            type: 'highlight' as const,
        },
    };

    return dispatch(createAnnotationAction(newAnnotation));
};
