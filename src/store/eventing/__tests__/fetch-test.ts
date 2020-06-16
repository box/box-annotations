import eventManager from '../../../common/EventManager';
import { AppState } from '../../types';
import { AsyncAction } from '../types';
import { handleFetchErrorEvents } from '../fetch';

jest.mock('../../../common/EventManager');

describe('store/eventing/fetch', () => {
    test('should emit fetch error event', () => {
        const error = new Error('fetch');
        handleFetchErrorEvents({} as AppState, {} as AppState, { error } as AsyncAction);

        expect(eventManager.emit).toBeCalledWith('annotations_fetch_error', { error });
    });
});
