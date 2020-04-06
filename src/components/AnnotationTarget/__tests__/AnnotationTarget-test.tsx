import React from 'react';
import { KEYS } from 'box-ui-elements/es/constants';
import { shallow, ShallowWrapper } from 'enzyme';
import AnnotationTarget from '../AnnotationTarget';

describe('AnnotationTarget', () => {
    const defaults = {
        annotationId: '1',
        onSelect: jest.fn(),
    };
    const mockEvent = {
        nativeEvent: {
            stopImmediatePropagation: jest.fn(),
        },
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
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
            ${KEYS.space}  | ${1}
        `('should handle the $key keypress event', ({ callCount, key }) => {
            const wrapper = getWrapper();

            wrapper.simulate('keyPress', { ...mockEvent, key });

            expect(mockEvent.nativeEvent.stopImmediatePropagation).toHaveBeenCalledTimes(callCount);
            expect(mockEvent.preventDefault).toHaveBeenCalledTimes(callCount);
            expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(callCount);
            expect(defaults.onSelect).toHaveBeenCalledTimes(callCount);
        });
    });

    describe('mouse event handlers', () => {
        test.each(['click', 'focus'])('should cancel the %s event and trigger onSelect', event => {
            const wrapper = getWrapper();

            wrapper.simulate(event, mockEvent);

            expect(mockEvent.nativeEvent.stopImmediatePropagation).toHaveBeenCalled();
            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(mockEvent.stopPropagation).toHaveBeenCalled();
            expect(defaults.onSelect).toHaveBeenCalledWith('1');
        });
    });

    describe('render()', () => {
        test('should pass the required props to the underlying anchor', () => {
            const wrapper = getWrapper({ className: 'ba-Test' });

            expect(wrapper.props()).toMatchObject({
                className: 'ba-AnnotationTarget ba-Test',
                role: 'button',
                tabIndex: 0,
            });
        });
    });
});
