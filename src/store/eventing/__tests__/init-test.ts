import eventManager from '../../../common/EventManager';
import annotationState from '../../annotations/__mocks__/annotationsState';
import { AppState } from '../../types';
import { handleAnnotationsInitialized } from '../init';

jest.mock('../../../common/EventManager');

describe('store/eventing/init', () => {
    test('should emit annotations_initialized event', () => {
        handleAnnotationsInitialized({} as AppState, { annotations: annotationState } as AppState);

        expect(eventManager.emit).toBeCalledWith('annotations_initialized', {
            annotations: [annotationState.byId.test1, annotationState.byId.test2, annotationState.byId.test3],
        });
    });
});
