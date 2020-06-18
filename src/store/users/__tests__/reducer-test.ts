import reducer from '../reducer';
import state from '../__mocks__/usersState';
import { fetchCollaboratorsAction } from '../actions';

describe('store/users/reducer', () => {
    describe('fetchCollaboratorsAction', () => {
        test('should set state when fulfilled', () => {
            const collaborators = [
                { id: 'testid1', name: 'test1', item: { id: 'testid1', name: 'test1', type: 'user' as const } },
                { id: 'testid2', name: 'test2', item: { id: 'testid2', name: 'test2', type: 'group' as const } },
            ];

            const newState = reducer(
                state,
                fetchCollaboratorsAction.fulfilled(
                    { entries: collaborators, limit: 25, next_marker: null, previous_marker: null },
                    'fulfilled',
                    'test',
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
