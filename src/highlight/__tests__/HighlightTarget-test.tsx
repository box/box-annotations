import React from 'react';
import * as ReactRedux from 'react-redux';
import { shallow, ShallowWrapper } from 'enzyme';
import HighlightTarget from '../HighlightTarget';

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useState: jest.fn(),
}));

describe('HighlightTarget', () => {
    const defaults = {
        annotationId: '123',
        onHover: jest.fn(),
        onSelect: jest.fn(),
        shapes: [
            {
                height: 10,
                type: 'rect' as const,
                width: 20,
                x: 5,
                y: 5,
            },
        ],
    };
    const mockSetIsHover = jest.fn();
    const getWrapper = (props = {}): ShallowWrapper => shallow(<HighlightTarget {...defaults} {...props} />);

    beforeEach(() => {
        jest.spyOn(ReactRedux, 'useSelector').mockImplementation(() => true);
        jest.spyOn(React, 'useState').mockImplementation(() => [false, mockSetIsHover]);
    });

    describe('render()', () => {
        test('should render anchor with provided rects', () => {
            const wrapper = getWrapper();
            const anchor = wrapper.find('a');
            const rect = wrapper.find('rect');

            expect(anchor.hasClass('is-active')).toBe(false);
            expect(anchor.hasClass('is-hover')).toBe(false);

            expect(rect.prop('height')).toBe('10%');
            expect(rect.prop('width')).toBe('20%');
            expect(rect.prop('x')).toBe('5%');
            expect(rect.prop('y')).toBe('5%');
        });
    });

    describe('interactivity', () => {
        test('should call onSelect when anchor is focused', () => {
            const wrapper = getWrapper();
            const anchor = wrapper.find('a');

            anchor.simulate('focus');

            expect(defaults.onSelect).toHaveBeenCalledWith(defaults.annotationId);
        });

        describe('handleMouseEnter()', () => {
            test('should call onHover with annotationId', () => {
                const wrapper = getWrapper();
                const anchor = wrapper.find('a');

                anchor.simulate('mouseenter');

                expect(defaults.onHover).toHaveBeenCalledWith(defaults.annotationId);
            });
        });

        describe('handleMouseLeave()', () => {
            test('should call onHover with null', () => {
                const wrapper = getWrapper();
                const anchor = wrapper.find('a');

                anchor.simulate('mouseleave');

                expect(defaults.onHover).toHaveBeenCalledWith(null);
            });
        });
    });
});
