import reducer from '../reducer';
import state from '../__mocks__/annotationsState';
import { Annotation } from '../../../@types';
import { setAnnotation, setAnnotations } from '../actions';

describe('store/annotations/reducer', () => {
    describe('setAnnotation', () => {
        test('should set the annotation in state', () => {
            const payload = { id: 'test' } as Annotation;
            const newState = reducer(state, setAnnotation(payload));

            expect(newState.allIds).toContain(payload.id);
            expect(newState.byId.test).toEqual(payload);
        });
    });

    describe('setAnnotations', () => {
        test('should set the annotations in state', () => {
            const payload = [{ id: 'testNew1' } as Annotation, { id: 'testNew2' } as Annotation];
            const newState = reducer(state, setAnnotations(payload));

            expect(newState.allIds).toEqual(['testNew1', 'testNew2']);
            expect(newState.byId).toMatchObject({
                testNew1: { id: 'testNew1' },
                testNew2: { id: 'testNew2' },
            });
        });
    });
});
