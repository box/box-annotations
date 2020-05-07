import usersState from '../__mocks__/usersState';
import { getCollaborators } from '../selectors';

describe('store/users/selectors', () => {
    const state = { users: usersState };

    describe('getCollaborators', () => {
        test('should return the initial collaborators', () => {
            expect(getCollaborators(state)).toEqual([]);
        });
    });
});
