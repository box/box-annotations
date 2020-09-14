import eventManager from '../../../common/EventManager';
import { AppState } from '../../types';
import { handleSetStatusAction } from '../status';

jest.mock('../../../common/EventManager');

describe('store/eventing/status', () => {
    test('should emit creator_status_change with status and type', () => {
        handleSetStatusAction(
            {
                common: {
                    mode: 'region',
                },
                creator: {
                    status: 'init',
                },
            } as AppState,
            {
                common: {
                    mode: 'region',
                },
                creator: {
                    status: 'started',
                },
            } as AppState,
        );

        expect(eventManager.emit).toBeCalledWith('creator_status_change', { status: 'started', type: 'region' });
    });

    test('should not emit event if status does not change', () => {
        handleSetStatusAction(
            {
                creator: {
                    status: 'init',
                },
            } as AppState,
            {
                creator: {
                    status: 'init',
                },
            } as AppState,
        );

        expect(eventManager.emit).not.toBeCalled();
    });
});
