import reducer from '../reducer';
import state from '../__mocks__/annotationsState';
import { Annotation, NewAnnotation } from '../../../@types';
import { APICollection } from '../../../api';
import {
    createAnnotationAction,
    removeAnnotationAction,
    fetchAnnotationsAction,
    setActiveAnnotationIdAction,
} from '../actions';

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

    describe('createAnnotationAction', () => {
        test('should set state when fulfilled', () => {
            const annotation = { id: 'anno_1', type: 'annotation' };
            const payload = { entries: [annotation], limit: 1000, next_marker: null } as APICollection<Annotation>;
            const newState = reducer(state, fetchAnnotationsAction.fulfilled(payload, 'test', undefined));

            expect(newState.activeId).toEqual(null);
            expect(newState.allIds).toContain(payload.entries[0].id);
            expect(newState.byId.anno_1).toEqual(payload.entries[0]);
        });
    });

    describe('setActiveAnnotationIdAction', () => {
        test.each(['123', null])('should set activeId state appropriately with %s', annotationId => {
            const payload = annotationId;
            const newState = reducer(state, setActiveAnnotationIdAction(payload));

            expect(newState.activeId).toBe(payload);
        });
    });

    describe('removeAnnotatorAction', () => {
        test('should delete an annotation from the store', () => {
            const payload = 'test1';
            const newState = reducer(state, removeAnnotationAction(payload));

            expect(newState.allIds).not.toContain(payload);
            expect(newState.byId.test1).toBe(undefined);
        });

        test('should set activeId to null if deleted annotation is active', () => {
            const payload = 'test1';
            const stateWithActiveId = reducer(state, setActiveAnnotationIdAction(payload));
            const newState = reducer(stateWithActiveId, removeAnnotationAction(payload));

            expect(newState.activeId).toBe(null);
        });
    });
});
