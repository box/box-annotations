import API from '../../../api';
import { createAnnotationAction, fetchAnnotationsAction } from '../actions';
import { NewAnnotation } from '../../../@types';

jest.mock('../../../api/APIFactory');

describe('store/annotations/actions', () => {
    const api = new API({ token: 'token_1234' });
    const dispatch = jest.fn();
    const getState = jest.fn().mockReturnValue({
        options: {
            fileId: '12345',
            fileVersionId: '67890',
            permissions: {
                can_create_annotations: true,
                can_view_annotations: true,
            },
        },
    });

    describe('createAnnotationAction', () => {
        const arg = { target: { shape: { x: 10, y: 10 } } } as NewAnnotation;

        test('should return a promise that resolves with an annotation', async () => {
            const result = await createAnnotationAction(arg)(dispatch, getState, { api });

            expect(result.payload).toMatchObject({
                id: expect.any(String),
                target: expect.any(Object),
                type: 'annotation',
            });
        });

        test('should abort the request if the action abort method is called', async () => {
            const action = createAnnotationAction(arg)(dispatch, getState, { api });

            action.abort();

            const result = await action;

            expect(result.meta).toMatchObject({ aborted: true });
            expect(result.payload).toBe(undefined);
        });
    });

    describe('fetchAnnotationAction', () => {
        test('should return a promise that resolves with a collection of annotations', async () => {
            const result = await fetchAnnotationsAction()(dispatch, getState, { api });

            expect(result.payload).toMatchObject({
                entries: expect.any(Array),
                limit: expect.any(Number),
            });
        });

        test('should abort the request if the action abort method is called', async () => {
            const action = fetchAnnotationsAction()(dispatch, getState, { api });

            action.abort();

            const result = await action;

            expect(result.meta).toMatchObject({ aborted: true });
            expect(result.payload).toBe(undefined);
        });
    });
});
