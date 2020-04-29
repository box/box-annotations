import React from 'react';
import scrollIntoView from 'scroll-into-view-if-needed';
import { KEYS } from 'box-ui-elements/es/constants';
import { mount, ReactWrapper } from 'enzyme';
import AnnotationTarget from '../AnnotationTarget';

jest.mock('scroll-into-view-if-needed');

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
    const getWrapper = (props = {}): ReactWrapper => {
        return mount(
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
        test.each`
            event      | onSelectArgument
            ${'blur'}  | ${null}
            ${'click'} | ${'1'}
            ${'focus'} | ${'1'}
        `('should cancel the $event and trigger onSelect with $onSelectArgument', ({ event, onSelectArgument }) => {
            const wrapper = getWrapper();

            wrapper.simulate(event, mockEvent);

            expect(mockEvent.nativeEvent.stopImmediatePropagation).toHaveBeenCalled();
            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(mockEvent.stopPropagation).toHaveBeenCalled();
            expect(defaults.onSelect).toHaveBeenCalledWith(onSelectArgument);
        });
    });

    describe('scroll if isActive', () => {
        test('should call scrollIntoView on isActive', () => {
            const wrapper = getWrapper({ isActive: false });

            wrapper.setProps({ isActive: true });
            expect(scrollIntoView).toHaveBeenCalled();
        });
    });

    describe('render()', () => {
        test('should pass the required props to the underlying anchor', () => {
            const wrapper = getWrapper({ className: 'ba-Test' });

            // Get the inner anchor element
            const innerAnchor = wrapper.childAt(0);
            expect(innerAnchor.props()).toMatchObject({
                className: 'ba-AnnotationTarget ba-Test',
                role: 'button',
                tabIndex: 0,
            });
        });
    });
});
