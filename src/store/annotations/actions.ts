import { createAction, createAsyncThunk, nanoid } from '@reduxjs/toolkit';
import { Annotation, NewAnnotation } from '../../@types';

export const createAnnotationAction = createAsyncThunk('CREATE_ANNOTATION', async (annotation: NewAnnotation) => {
    // TODO: Replace with actual API call
    const request = (ms = 0): Promise<{ data: Annotation }> =>
        new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                    // @ts-ignore
                    data: {
                        ...annotation,
                        id: nanoid(),
                        type: 'annotation',
                    },
                });
            }, ms);
        });

    const response = await request(500);
    return response.data;
});

export const setActiveAnnotationIdAction = createAction<string | null>('SET_ACTIVE_ANNOTATION_ID');
