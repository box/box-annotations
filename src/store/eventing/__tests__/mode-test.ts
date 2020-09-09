import eventManager from '../../../common/EventManager';
import { AppState } from '../../types';
import { handleToggleAnnotationModeAction } from '../mode';

jest.mock('../../../common/EventManager');

describe('store/eventing/mode', () => {
    test('should emit annotations_mode_change with the next mode when changing annotation modes.', () => {
        const nextState = {
            common: {
                mode: 'region',
            },
        } as AppState;

        handleToggleAnnotationModeAction({} as AppState, nextState);

        expect(eventManager.emit).toBeCalledWith('annotations_mode_change', { mode: 'region' });
    });
});
