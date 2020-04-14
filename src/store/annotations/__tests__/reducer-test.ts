import reducer from '../reducer';
import state from '../__mocks__/annotationsState';
import { Annotation, NewAnnotation } from '../../../@types';
import { createAnnotationAction, setActiveAnnotationIdAction } from '../actions';

describe('store/annotations/reducer', () => {
    describe('createAnnotationAction', () => {
        test('should set state when fulfilled', () => {
            const arg = {} as NewAnnotation;
            const payload = { id: 'anno_1', type: 'annotation' } as Annotation;
            const newState = reducer(state, createAnnotationAction.fulfilled(payload, 'test', arg));

            expect(newState.allIds).toContain(payload.id);
            expect(newState.byId.anno_1).toEqual(payload);
        });
    });

    describe('setActiveAnnotationIdAction', () => {
        test.each(['123', null])('should set activeId state appropriately with %s', annotationId => {
            const payload = annotationId;
            const newState = reducer(state, setActiveAnnotationIdAction(payload));

            expect(newState.activeId).toBe(payload);
        });
    });
});
