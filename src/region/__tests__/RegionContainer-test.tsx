import { createStore, initialState, Mode } from '../../store';
import { mapStateToProps } from '../RegionContainer';

describe('RegionContainer', () => {
    describe('mapStateToProps()', () => {
        test.each`
            mode           | isCreating
            ${undefined}   | ${false}
            ${Mode.NONE}   | ${false}
            ${Mode.REGION} | ${true}
        `('should pass isCreating based on the current mode', ({ isCreating, mode }) => {
            const store = createStore({ ...initialState, mode: { current: mode } });

            expect(mapStateToProps(store.getState())).toMatchObject({
                isCreating,
            });
        });
    });
});
