import reducer from '../reducer';
import state from '../__mocks__/usersState';
import { fetchCollaboratorsAction } from '../actions';

describe('store/users/reducer', () => {
    describe('fetchCollaboratorsAction', () => {
        test('should set state when fulfilled', () => {
            const collaborators = [{ id: '1234567890', name: 'Test User' }];

            const newState = reducer(
                state,
                fetchCollaboratorsAction.fulfilled(
                    { entries: collaborators, limit: 10, next_marker: null, previous_marker: null },
                    'fulfilled',
                    undefined,
                ),
            );

            expect(newState.collaborators).toEqual(collaborators);
        });

        test('should set state when rejected', () => {
            const newState = reducer(state, fetchCollaboratorsAction.rejected);

            expect(newState.collaborators).toEqual([]);
        });
    });
});
