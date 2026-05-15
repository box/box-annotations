import state from '../__mocks__/highlightState';
import { mockContainerRect, mockDOMRect, mockRange, mockRotatedContainerEl, mockRotatedContainerRect } from '../__mocks__/data';
import { setSelectionAction } from '../actions';

describe('store/highlight/actions', () => {
    describe('setSelectionAction', () => {
        const arg = {
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

        test('should return null payload when arg is null', () => {
            expect(setSelectionAction(null)).toEqual({
                payload: null,
                type: 'SET_SELECTION',
            });
        });

        describe('with rotation', () => {
            beforeEach(() => {
                jest.spyOn(mockRotatedContainerEl, 'getBoundingClientRect').mockReturnValue(mockRotatedContainerRect);
            });

            test('should prepare correct argument when rotated', () => {
                const rotatedArg = {
                    ...arg,
                    containerEl: mockRotatedContainerEl,
                    rotation: -90,
                };

                const result = setSelectionAction(rotatedArg);

                // we use toBeCloseTo for rects due to floating-point tolerance from trig calculations
                const rect = result.payload!.rects[0];
                expect(rect.x).toBeCloseTo(state.rotatedSelection.rects[0].x);
                expect(rect.y).toBeCloseTo(state.rotatedSelection.rects[0].y);
                expect(rect.width).toBeCloseTo(state.rotatedSelection.rects[0].width);
                expect(rect.height).toBeCloseTo(state.rotatedSelection.rects[0].height);

                expect(result.payload.containerRect).toEqual(state.rotatedSelection.containerRect);
                expect(result.payload.popupRect).toEqual(state.rotatedSelection.popupRect);
                expect(result.payload.location).toEqual(state.rotatedSelection.location);
            });

            test('should prepare correct argument when rotation is 0', () => {
                const noRotationArg = {
                    ...arg,
                    containerEl: mockRotatedContainerEl,
                    rotation: 0,
                };

                expect(setSelectionAction(noRotationArg)).toEqual({
                    payload: state.selection,
                    type: 'SET_SELECTION',
                });
            });

            test('should prepare correct argument when containerEl is null', () => {
                const noContainerArg = {
                    ...arg,
                    containerEl: null,
                    rotation: -90,
                };

                expect(setSelectionAction(noContainerArg)).toEqual({
                    payload: state.selection,
                    type: 'SET_SELECTION',
                });
            });
        });
    });
});
