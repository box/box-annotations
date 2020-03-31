import React from 'react';
import { KEYS } from 'box-ui-elements/es/constants';
import { shallow, ShallowWrapper } from 'enzyme';
import AnnotationTarget from '../AnnotationTarget';

describe('AnnotationTarget', () => {
    const defaults = {
        annotationId: '1',
        onSelect: jest.fn(),
    };
    const getWrapper = (props = {}): ShallowWrapper => {
        return shallow(
            <AnnotationTarget {...defaults} {...props}>
                Test
            </AnnotationTarget>,
        );
    };

    describe('keyboard event handlers', () => {
        test.each`
            key            | callCount
            ${KEYS.enter}  | ${1}
            ${KEYS.escape} | ${0}
            ${KEYS.space}  | ${0}
        `('should handle the $key keypress event', ({ callCount, key }) => {
            const mockEvent = {
                key,
                nativeEvent: {
                    stopImmediatePropagation: jest.fn(),
                },
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
            };
            const onSelect = jest.fn();
            const wrapper = getWrapper({ onSelect });

            wrapper.simulate('keyPress', mockEvent);

            expect(mockEvent.nativeEvent.stopImmediatePropagation).toHaveBeenCalledTimes(callCount);
            expect(mockEvent.preventDefault).toHaveBeenCalledTimes(callCount);
            expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(callCount);
            expect(onSelect).toHaveBeenCalledTimes(callCount);
        });
    });

    describe('mouse event handlers', () => {
        test.each(['click', 'focus'])('should cancel the %s event and trigger onSelect', event => {
            const mockEvent = {
                nativeEvent: {
                    stopImmediatePropagation: jest.fn(),
                },
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
            };
            const onSelect = jest.fn();
            const wrapper = getWrapper({ onSelect });

            wrapper.simulate(event, mockEvent);

            expect(mockEvent.nativeEvent.stopImmediatePropagation).toHaveBeenCalled();
            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(mockEvent.stopPropagation).toHaveBeenCalled();
            expect(onSelect).toHaveBeenCalledWith('1');
        });
    });

    describe('render()', () => {
        test('should pass the required props to the underlying anchor', () => {
            const wrapper = getWrapper({ className: 'ba-Test' });

            expect(wrapper.props()).toMatchObject({
                className: 'ba-Test',
                role: 'button',
                tabIndex: 0,
            });
        });
    });
});
