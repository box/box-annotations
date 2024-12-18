import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import HighlightTarget from '../HighlightTarget';

jest.mock('../../common/useMountId');

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

    const getWrapper = (props = {}): ShallowWrapper => shallow(<HighlightTarget {...defaults} {...props} />);

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
                button: 0,
                currentTarget: {
                    focus: jest.fn(),
                },
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
            };

            test('should do nothing if button is not MOUSE_PRIMARY', () => {
                const wrapper = getWrapper();
                const anchor = wrapper.find('a');
                const event = {
                    ...mockEvent,
                    button: 1,
                };

                anchor.simulate('mousedown', event);

                expect(mockEvent.preventDefault).not.toHaveBeenCalled();
                expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
            });

            test('should focus target', () => {
                const wrapper = getWrapper();
                const anchor = wrapper.find('a');

                anchor.simulate('mousedown', mockEvent);

                expect(mockEvent.preventDefault).toHaveBeenCalled();
                expect(mockEvent.stopPropagation).toHaveBeenCalled();
                expect(mockEvent.currentTarget.focus).toHaveBeenCalled();
            });

            test('should call onSelect if focus is not supported', () => {
                const onSelect = jest.fn();
                const wrapper = getWrapper({ onSelect });
                const anchor = wrapper.find('a');
                const event = {
                    ...mockEvent,
                    currentTarget: {},
                };

                anchor.simulate('mousedown', event);

                expect(onSelect).toHaveBeenCalledWith('123');
                expect(event.preventDefault).toHaveBeenCalled();
                expect(event.stopPropagation).toHaveBeenCalled();
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

            expect(handleMount).toHaveBeenCalledWith('123');
        });
    });
});
