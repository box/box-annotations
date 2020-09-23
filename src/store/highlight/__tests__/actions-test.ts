import state from '../__mocks__/highlightState';
import { mockContainerRect, mockDOMRect, mockRange } from '../__mocks__/data';
import { setSelectionAction } from '../actions';

describe('store/highlight/actions', () => {
    describe('setSelectionAction', () => {
        const arg = {
            canCreate: true,
            containerRect: mockContainerRect,
            location: 1,
            range: mockRange,
        };

        test('should prepare correct argument', () => {
            expect(setSelectionAction(arg)).toEqual({
                payload: state.selection,
                type: 'SET_SELECTION',
            });
        });

        test('should prepare correct argument in IE/Edge', () => {
            jest.spyOn(document, 'createNodeIterator').mockReturnValueOnce(({
                nextNode: jest.fn().mockReturnValueOnce(mockRange.startContainer),
            } as unknown) as NodeIterator);
            jest.spyOn(document, 'createRange').mockReturnValueOnce({
                ...new Range(),
                getBoundingClientRect: jest.fn().mockReturnValueOnce(mockDOMRect),
                selectNodeContents: jest.fn(),
                setEnd: jest.fn(),
                setStart: jest.fn(),
            });
            const range = {
                ...mockRange,
                getClientRects: () => ({ length: 0 } as DOMRectList),
            };

            const newArg = {
                ...arg,
                range,
            };

            expect(setSelectionAction(newArg)).toEqual({
                payload: state.selection,
                type: 'SET_SELECTION',
            });
        });
    });
});
