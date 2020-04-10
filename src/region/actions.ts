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
            shape,
            type: 'region' as const,
        },
    };

    return dispatch(createAnnotationAction(payload));
});
