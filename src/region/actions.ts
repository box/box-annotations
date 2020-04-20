import { createAsyncThunk } from '@reduxjs/toolkit';
import { Rect } from '../@types';
import { createAnnotationAction } from '../store/annotations';

export type CreateArg = {
    location: number;
    message: string;
    shape: Rect;
};

export const createRegionAction = createAsyncThunk('CREATE_REGION', async (arg: CreateArg, { dispatch }) => {
    const { location, message, shape } = arg;
    const payload = {
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

    return dispatch(createAnnotationAction(payload));
});
