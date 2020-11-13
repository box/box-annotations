import React, { MutableRefObject } from 'react';
import * as ReactRedux from 'react-redux';
import { shallow, ShallowWrapper } from 'enzyme';
import HighlightTarget, { Props } from '../HighlightTarget';

describe('HighlightTarget', () => {
    const getDefaults = (): Props => ({
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
    });

    const getWrapper = (props = {}): ShallowWrapper => shallow(<HighlightTarget {...getDefaults()} {...props} />);
    const mockInitalRef = { current: '123' } as MutableRefObject<string>;

    beforeEach(() => {
        jest.spyOn(React, 'useEffect').mockImplementation(f => f());
        jest.spyOn(React, 'useRef').mockImplementation(() => mockInitalRef);
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
            const onSelect = jest.fn();
            const wrapper = getWrapper({ onSelect });
            const anchor = wrapper.find('a');

            anchor.simulate('focus');

            expect(onSelect).toHaveBeenCalledWith('123');
        });

        describe('handleMouseDown()', () => {
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            const getEvent = () => ({
                buttons: 1,
                currentTarget: {
                    focus: jest.fn(),
                },
                preventDefault: jest.fn(),
                nativeEvent: {
                    stopImmediatePropagation: jest.fn(),
                },
            });

            test('should do nothing if button is not MOUSE_PRIMARY', () => {
                const wrapper = getWrapper();
                const anchor = wrapper.find('a');
                const event = {
                    ...getEvent(),
                    buttons: 2,
                };

                anchor.simulate('mousedown', event);

                expect(event.preventDefault).not.toHaveBeenCalled();
                expect(event.nativeEvent.stopImmediatePropagation).not.toHaveBeenCalled();
            });

            test('should call focus if focus is supported', () => {
                const wrapper = getWrapper();
                const anchor = wrapper.find('a');
                const mockEvent = getEvent();

                anchor.simulate('mousedown', mockEvent);

                expect(mockEvent.preventDefault).toHaveBeenCalled();
                expect(mockEvent.nativeEvent.stopImmediatePropagation).toHaveBeenCalled();
                expect(mockEvent.currentTarget.focus).toHaveBeenCalled();
            });

            test('should call onSelect if focus is not supported', () => {
                const onSelect = jest.fn();
                const wrapper = getWrapper({ onSelect });
                const anchor = wrapper.find('a');
                const event = {
                    ...getEvent(),
                    currentTarget: {},
                };

                anchor.simulate('mousedown', event);

                expect(onSelect).toHaveBeenCalledWith('123');
                expect(event.preventDefault).toHaveBeenCalled();
                expect(event.nativeEvent.stopImmediatePropagation).toHaveBeenCalled();
            });
        });

        describe('handleMouseEnter()', () => {
            test('should call onHover with annotationId', () => {
                const onHover = jest.fn();
                const wrapper = getWrapper({ onHover });
                const anchor = wrapper.find('a');

                anchor.simulate('mouseenter');

                expect(onHover).toHaveBeenCalledWith('123');
            });
        });

        describe('handleMouseLeave()', () => {
            test('should call onHover with null', () => {
                const onHover = jest.fn();
                const wrapper = getWrapper({ onHover });
                const anchor = wrapper.find('a');

                anchor.simulate('mouseleave');

                expect(onHover).toHaveBeenCalledWith(null);
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
