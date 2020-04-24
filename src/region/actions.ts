import { AppThunkDispatch } from '../store';
import { createAnnotationAction } from '../store/annotations';
import { Rect } from '../@types';

export type CreateArg = {
    location: number;
    message: string;
    shape: Rect;
};

export const createRegionAction = (arg: CreateArg) => (dispatch: AppThunkDispatch) => {
    const { location, message, shape } = arg;
    const newAnnotation = {
        description: {
            message,
            type: 'reply' as const,
        },
        target: {
            location: {
                type: 'page' as const,
                value: location,
            },
            shape: {
                ...shape,
                height: Math.round(shape.height),
                width: Math.round(shape.width),
                x: Math.round(shape.x),
                y: Math.round(shape.y),
            },
            type: 'region' as const,
        },
    };

    return dispatch(createAnnotationAction(newAnnotation));
};
