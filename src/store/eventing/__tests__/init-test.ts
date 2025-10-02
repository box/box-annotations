import eventManager from '../../../common/EventManager';
import {annotationState} from '../../annotations/__mocks__/annotationsState';
import { AppState } from '../../types';
import { handleAnnotationsInitialized } from '../init';

jest.mock('../../../common/EventManager');

describe('store/eventing/init', () => {
    test('should emit annotations_initialized event with annotations if isInitialized changes to true', () => {
        handleAnnotationsInitialized(
            { annotations: { ...annotationState, isInitialized: false } } as AppState,
            { annotations: { ...annotationState, isInitialized: true } } as AppState,
        );

        expect(eventManager.emit).toBeCalledWith('annotations_initialized', {
            annotations: [annotationState.byId.test1, annotationState.byId.test2, annotationState.byId.test3],
        });
    });

    test('should do nothing if isInitialized changes to false', () => {
        handleAnnotationsInitialized(
            { annotations: { ...annotationState, isInitialized: true } } as AppState,
            { annotations: { ...annotationState, isInitialized: false } } as AppState,
        );

        expect(eventManager.emit).not.toBeCalled();
    });

    test('should do nothing if isInitialized does not change', () => {
        handleAnnotationsInitialized(
            { annotations: { ...annotationState, isInitialized: true } } as AppState,
            { annotations: { ...annotationState, isInitialized: true } } as AppState,
        );

        expect(eventManager.emit).not.toBeCalled();
    });
});
