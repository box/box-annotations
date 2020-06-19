import { Action } from '@reduxjs/toolkit';
import eventManager from '../../../common/EventManager';
import { AppState } from '../../types';
import { handleToggleAnnotationModeAction } from '../mode';

jest.mock('../../../common/EventManager');

describe('store/eventing/init', () => {
    test('should emit annotations_mode_change when ', () => {
        const action = {
            type: 'action',
            payload: 'region',
        } as Action;

        handleToggleAnnotationModeAction({} as AppState, {} as AppState, action);

        expect(eventManager.emit).toBeCalledWith('annotations_mode_change', action);
    });
});
