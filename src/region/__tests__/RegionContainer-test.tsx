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
            const props = { page: 1 };
            const store = createStore({ common: { mode, visibility: true } });

            expect(mapStateToProps(store.getState(), props)).toMatchObject({
                isCreating,
            });
        });
    });
});
