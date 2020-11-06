import React, { MutableRefObject } from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import DrawingTarget from '../DrawingTarget';
import { annotations } from '../__mocks__/data';
import { getShape } from '../drawingUtil';

const { target: mockTarget } = annotations[0];

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useState: jest.fn(),
}));

describe('DrawingTarget', () => {
    const defaults = {
        annotationId: '123',
        onSelect: jest.fn(),
        target: mockTarget,
    };

    const getWrapper = (props = {}): ShallowWrapper => shallow(<DrawingTarget {...defaults} {...props} />);
    const mockInitalRef = { current: '123' } as MutableRefObject<string>;

    beforeEach(() => {
        jest.spyOn(React, 'useRef').mockImplementation(() => mockInitalRef);
    });

    describe('render()', () => {
        test('should render anchor with provided shape', () => {
            const rect = getWrapper().find('rect');

            const { height, width, x, y } = getShape(mockTarget.path_groups);

            expect(rect.prop('height')).toBe(height);
            expect(rect.prop('width')).toBe(width);
            expect(rect.prop('x')).toBe(x);
            expect(rect.prop('y')).toBe(y);
        });

        test.each([true, false])('should render classNames correctly when isActive is %s', isActive => {
            const wrapper = getWrapper({ isActive });
            const anchor = wrapper.find('a');

            expect(anchor.hasClass('ba-DrawingTarget')).toBe(true);
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
    });
});
