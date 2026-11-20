import { mapStateToProps } from '../HtmlHighlightContainer';
import { annotation } from '../../highlight/__mocks__/data';
import { Annotation } from '../../@types';
import { createStore, fetchAnnotationsAction } from '../../store';

jest.mock('@box/blueprint-web', () => ({}));
jest.mock('@box/threaded-annotations', () => ({}));

describe('html/HtmlHighlightContainer', () => {
    const missing = { ...annotation, id: 'missing', target: { ...annotation.target, text: 'missing' } };
    const found = { ...annotation, target: { ...annotation.target, text: 'found' } };
    const shapes = [{ height: 2, type: 'rect' as const, width: 20, x: 10, y: 50 }];
    const getState = (): ReturnType<ReturnType<typeof createStore>['getState']> => {
        const store = createStore();
        const payload = {
            entries: [found, missing] as Annotation[],
            limit: 1000,
            next_marker: null,
            previous_marker: null,
        };
        store.dispatch(fetchAnnotationsAction.fulfilled(payload, 'test', undefined));
        return store.getState();
    };

    describe('mapStateToProps()', () => {
        test('should render highlights at their current shapes and leave out unmatched ones', () => {
            const getShapes = jest.fn(target => (target.text === 'found' ? shapes : null));

            const props = mapStateToProps(getState(), { getShapes, location: 1 });

            expect(getShapes).toHaveBeenCalledTimes(2);
            expect(props.annotations).toEqual([{ ...found, target: { ...found.target, shapes } }]);
        });
    });
});
