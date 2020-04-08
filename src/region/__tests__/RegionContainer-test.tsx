import { state } from '../../store/common/__mocks__/state';
import { createStore, Mode } from '../../store';
import { mapStateToProps } from '../RegionContainer';

describe('RegionContainer', () => {
    describe('mapStateToProps()', () => {
        test.each`
            mode           | isCreating
            ${undefined}   | ${false}
            ${Mode.NONE}   | ${false}
            ${Mode.REGION} | ${true}
        `('should pass isCreating based on the current mode', ({ isCreating, mode }) => {
            const store = createStore({ common: { ...state, mode } });

            expect(mapStateToProps(store.getState())).toMatchObject({
                isCreating,
            });
        });
    });
});
