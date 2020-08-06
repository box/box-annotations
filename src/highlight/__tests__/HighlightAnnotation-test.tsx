import React from 'react';
import * as ReactRedux from 'react-redux';
import { shallow, ShallowWrapper } from 'enzyme';
import HighlightAnnotation from '../HighlightAnnotation';

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useState: jest.fn(),
}));

describe('components/highlight/HighlightAnnotation', () => {
    const defaults = {
        annotationId: '123',
        onSelect: jest.fn(),
        rects: [
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
    const getWrapper = (props = {}): ShallowWrapper => shallow(<HighlightAnnotation {...defaults} {...props} />);

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

        describe('handleMouseDown()', () => {
            const mockEvent = {
                buttons: 1,
                preventDefault: jest.fn(),
                nativeEvent: {
                    stopImmediatePropagation: jest.fn(),
                },
            };

            test('should do nothing if button is not MOUSE_PRIMARY', () => {
                const wrapper = getWrapper();
                const anchor = wrapper.find('a');
                const event = {
                    ...mockEvent,
                    buttons: 2,
                };

                anchor.simulate('mousedown', event);

                expect(defaults.onSelect).not.toHaveBeenCalled();
                expect(mockEvent.preventDefault).not.toHaveBeenCalled();
                expect(mockEvent.nativeEvent.stopImmediatePropagation).not.toHaveBeenCalled();
            });

            test('should call onSelect', () => {
                const wrapper = getWrapper();
                const anchor = wrapper.find('a');
                const event = {
                    ...mockEvent,
                    buttons: 1,
                };

                anchor.simulate('mousedown', event);

                expect(defaults.onSelect).toHaveBeenCalledWith(defaults.annotationId);
                expect(mockEvent.preventDefault).toHaveBeenCalled();
                expect(mockEvent.nativeEvent.stopImmediatePropagation).toHaveBeenCalled();
            });
        });
    });
});
