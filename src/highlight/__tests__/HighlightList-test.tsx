import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import HighlightAnnotation from '../HighlightAnnotation';
import HighlightList, { isValidHighlight, getHighlightArea, Props, sortHighlight } from '../HighlightList';
import useOutsideEvent from '../../common/useOutsideEvent';
import { annotation as mockAnnotation, rect as mockRect, target as mockTarget } from '../__mocks__/data';
import { Rect, AnnotationHighlight } from '../../@types';

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useState: jest.fn(),
}));

jest.mock('../../common/useOutsideEvent', () => jest.fn((name, ref, cb) => cb()));

describe('highlight/HighlightList', () => {
    const defaults: Props = {
        activeId: null,
        annotations: [mockAnnotation],
        onSelect: jest.fn(),
    };
    const getWrapper = (props?: Partial<Props>): ShallowWrapper => shallow(<HighlightList {...defaults} {...props} />);

    describe('isValidHighlight()', () => {
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

            expect(isValidHighlight(highlight)).toBe(isValid);
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

    describe('render()', () => {
        const mockSetIsListening = jest.fn();

        beforeEach(() => {
            jest.spyOn(React, 'useState').mockImplementation(() => [true, mockSetIsListening]);
        });

        test('should render svg and HighlightAnnotation', () => {
            const wrapper = getWrapper();

            expect(wrapper.find('svg').hasClass('is-listening')).toBe(true);
            expect(wrapper.find(HighlightAnnotation).exists()).toBe(true);
        });

        test('should not have is-listening class if isListening state is false', () => {
            jest.spyOn(React, 'useState').mockImplementationOnce(() => [false, mockSetIsListening]);

            const wrapper = getWrapper();

            expect(wrapper.find('svg').hasClass('is-listening')).toBe(false);
        });

        test.each`
            activeId | expectedIsActive
            ${null}  | ${false}
            ${'123'} | ${true}
        `(
            'should set isActive to $expectedIsActive on HighlightAnnotation if matches activeId $activeId',
            ({ activeId, expectedIsActive }) => {
                const wrapper = getWrapper({ activeId });

                expect(wrapper.find(HighlightAnnotation).prop('isActive')).toBe(expectedIsActive);
            },
        );

        test('should call useOutsideEvent', () => {
            getWrapper();

            expect(mockSetIsListening).toHaveBeenNthCalledWith(1, false); // mousedown
            expect(mockSetIsListening).toHaveBeenNthCalledWith(2, true); // mouseup
            expect(useOutsideEvent).toHaveBeenCalledTimes(2);
        });
    });
});
