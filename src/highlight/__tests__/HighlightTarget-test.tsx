import React from 'react';
import * as ReactRedux from 'react-redux';
import { mount, ReactWrapper } from 'enzyme';
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

    const getWrapper = (props = {}): ReactWrapper =>
        mount(
            <svg>
                <HighlightTarget {...defaults} {...props} />
            </svg>,
            { attachTo: document.getElementById('test') },
        );

    beforeEach(() => {
        document.body.innerHTML = '<div id="test"></div>';
        jest.spyOn(React, 'useEffect').mockImplementation(f => f());
        jest.spyOn(ReactRedux, 'useSelector').mockImplementation(() => true);
    });

    describe('render()', () => {
        test('should render anchor with provided rects', () => {
            const rect = getWrapper().find('rect');

            expect(rect.prop('height')).toBe('10%');
            expect(rect.prop('width')).toBe('20%');
            expect(rect.prop('x')).toBe('5%');
            expect(rect.prop('y')).toBe('5%');
        });

        test.each([true, false])('should render classNames correctly when isActive is %s', isActive => {
            const wrapper = getWrapper({ isActive });
            const anchor = wrapper.find('a');

            expect(anchor.hasClass('ba-HighlightTarget')).toBe(true);
            expect(anchor.hasClass('is-active')).toBe(isActive);
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
                currentTarget: {
                    focus: jest.fn(),
                },
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

                expect(mockEvent.preventDefault).not.toHaveBeenCalled();
                expect(mockEvent.nativeEvent.stopImmediatePropagation).not.toHaveBeenCalled();
            });

            test('should call onSelect', () => {
                const wrapper = getWrapper();
                const anchor = wrapper.find('a');

                anchor.prop('onMouseDown')!((mockEvent as unknown) as React.MouseEvent);

                expect(defaults.onSelect).toHaveBeenCalledWith('123');
                expect(mockEvent.preventDefault).toHaveBeenCalled();
                expect(mockEvent.nativeEvent.stopImmediatePropagation).toHaveBeenCalled();
                expect(mockEvent.currentTarget.focus).toHaveBeenCalled();
            });

            test('should call blur on the document.activeElement', () => {
                const blurSpy = jest.spyOn(document.body, 'blur');
                const wrapper = getWrapper();
                const anchor = wrapper.find('a');
                const event = {
                    ...mockEvent,
                    buttons: 1,
                };

                expect(document.activeElement).toBe(document.body);

                anchor.simulate('mousedown', event);

                expect(blurSpy).toHaveBeenCalled();
            });
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

    describe('onMount()', () => {
        test('should call onMount with a generated uuid', () => {
            const handleMount = jest.fn();
            getWrapper({ onMount: handleMount });

            expect(handleMount).toHaveBeenCalledWith(expect.any(String));
        });
    });
});
