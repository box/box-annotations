import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import HighlightAnnotation from '../HighlightTarget';
import HighlightList, { filterHighlight, getHighlightArea, Props, sortHighlight } from '../HighlightList';
import HighlightSvg from '../HighlightSvg';
import useOutsideEvent from '../../common/useOutsideEvent';
import { annotation as mockAnnotation, rect as mockRect, target as mockTarget } from '../__mocks__/data';
import { AnnotationHighlight, Rect } from '../../@types';

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useState: jest.fn(),
}));

jest.mock('../../common/useOutsideEvent', () => jest.fn((name, ref, cb) => cb()));

describe('HighlightList', () => {
    const defaults: Props = {
        annotations: [mockAnnotation],
        onSelect: jest.fn(),
    };
    const getWrapper = (props?: Partial<Props>): ShallowWrapper => shallow(<HighlightList {...defaults} {...props} />);

    describe('render()', () => {
        const mockSetIsListening = jest.fn();

        beforeEach(() => {
            jest.spyOn(React, 'useState').mockImplementation(() => [true, mockSetIsListening]);
        });

        test('should render HighlightSvg and HighlightAnnotation', () => {
            const wrapper = getWrapper();

            expect(wrapper.find(HighlightSvg).hasClass('is-listening')).toBe(true);
            expect(wrapper.find(HighlightAnnotation).exists()).toBe(true);
        });

        test('should not have is-listening class if isListening state is false', () => {
            jest.spyOn(React, 'useState').mockImplementationOnce(() => [false, mockSetIsListening]);

            const wrapper = getWrapper();

            expect(wrapper.find(HighlightSvg).hasClass('is-listening')).toBe(false);
        });

        test('should call useOutsideEvent', () => {
            getWrapper();

            expect(mockSetIsListening).toHaveBeenNthCalledWith(1, false); // mousedown
            expect(mockSetIsListening).toHaveBeenNthCalledWith(2, true); // mouseup
            expect(useOutsideEvent).toHaveBeenCalledTimes(2);
        });
    });

    describe('filterHighlight()', () => {
        test.each`
            height | width | x     | y     | isValid
            ${10}  | ${20} | ${5}  | ${5}  | ${true}
            ${-1}  | ${20} | ${5}  | ${5}  | ${false}
            ${10}  | ${-1} | ${5}  | ${5}  | ${false}
            ${10}  | ${20} | ${-1} | ${5}  | ${false}
            ${10}  | ${20} | ${5}  | ${-1} | ${false}
        `('should return $isValid based on the rect properties', ({ height, width, x, y, isValid }) => {
            const rect: Rect = {
                ...mockRect,
                height,
                width,
                x,
                y,
            };
            const target = { ...mockTarget, shapes: [rect] };
            const highlight: AnnotationHighlight = {
                ...mockAnnotation,
                target,
            };

            expect(filterHighlight(highlight)).toBe(isValid);
        });
    });

    describe('getHighlightArea()', () => {
        test('should get total highlighted area', () => {
            const shapes = [mockRect, mockRect];
            expect(getHighlightArea(shapes)).toBe(400);
        });
    });

    describe('sortHighlight()', () => {
        test.each`
            widthA | heightA | widthB | heightB | returnValue
            ${1}   | ${1}    | ${1}   | ${2}    | ${1}
            ${2}   | ${1}    | ${1}   | ${1}    | ${-1}
            ${1}   | ${1}    | ${1}   | ${1}    | ${1}
        `(
            'should compare highlights based on area $areaA and $areaB with return $returnValue',
            ({ widthA, heightA, widthB, heightB, returnValue }) => {
                const rectA = {
                    ...mockRect,
                    height: heightA,
                    width: widthA,
                };
                const rectB = {
                    ...mockRect,
                    height: heightB,
                    width: widthB,
                };
                const targetA = {
                    ...mockTarget,
                    shapes: [rectA],
                };
                const targetB = {
                    ...mockTarget,
                    shapes: [rectB],
                };
                expect(
                    sortHighlight({ ...mockAnnotation, target: targetA }, { ...mockAnnotation, target: targetB }),
                ).toBe(returnValue);
            },
        );
    });
});
