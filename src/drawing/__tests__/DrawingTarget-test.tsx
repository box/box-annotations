import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import DrawingPathGroup from '../DrawingPathGroup';
import DrawingTarget, { Props } from '../DrawingTarget';
import { annotations } from '../__mocks__/drawingData';
import { getShape } from '../drawingUtil';

const { target: mockTarget } = annotations[0];

describe('DrawingTarget', () => {
    const getDefaults = (): Props => ({
        annotationId: '123',
        target: mockTarget,
        rootEl: null,
    });

    const getWrapper = (props = {}): ShallowWrapper => shallow(<DrawingTarget {...getDefaults()} {...props} />);

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

        test('should render correct number of DrawingPathGroup', () => {
            expect(getWrapper().find(DrawingPathGroup).length).toEqual(2);
        });
    });

    describe('interactivity', () => {
        test('should call onSelect when anchor is focused', () => {
            const mockOnSelect = jest.fn();
            const wrapper = getWrapper({ onSelect: mockOnSelect });
            const anchor = wrapper.find('a');

            anchor.simulate('focus');

            expect(mockOnSelect).toHaveBeenCalledWith(getDefaults().annotationId);
        });

        describe('handleMouseDown()', () => {
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            const getEvent = () => ({
                button: 0,
                currentTarget: {
                    focus: jest.fn(),
                },
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
            });

            test('should do nothing if button is not MOUSE_PRIMARY', () => {
                const wrapper = getWrapper();
                const anchor = wrapper.find('a');
                const event = {
                    ...getEvent(),
                    button: 1,
                };

                anchor.simulate('mousedown', event);

                expect(event.preventDefault).not.toHaveBeenCalled();
                expect(event.stopPropagation).not.toHaveBeenCalled();
            });

            test('should call focus if focus is supported', () => {
                const wrapper = getWrapper();
                const anchor = wrapper.find('a');
                const mockEvent = getEvent();

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
                    ...getEvent(),
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
                    ...getEvent(),
                    buttons: 1,
                };

                expect(document.activeElement).toBe(document.body);

                anchor.simulate('mousedown', event);

                expect(blurSpy).toHaveBeenCalled();
            });
        });
    });
});
