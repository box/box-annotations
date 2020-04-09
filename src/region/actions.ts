import { createAsyncThunk } from '@reduxjs/toolkit';
import { CreatorStatus, setStagedAction, setStatusAction } from '../store/creator';
import { Rect } from '../@types';
import { saveAnnotationAction } from '../store/annotations';

export type SavePayload = {
    location: number;
    message: string;
    shape: Rect;
};

export const saveRegionAction = createAsyncThunk('SAVE_REGION', async (arg: SavePayload, { dispatch }) => {
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

    return dispatch(saveAnnotationAction(payload)).then(() => {
        dispatch(setStagedAction(null));
        dispatch(setStatusAction(CreatorStatus.init));
    });
});
