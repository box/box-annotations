import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import RegionAnnotation from '../RegionAnnotation';
import { mockEvent } from '../../common/__mocks__/events';
import { rect } from '../__mocks__/data';

describe('RegionAnnotation', () => {
    const defaults = {
        annotationId: '1',
        isActive: false,
        onSelect: jest.fn(),
        shape: rect,
    };
    const getWrapper = (props = {}): ShallowWrapper => {
        return shallow(<RegionAnnotation {...defaults} {...props} />);
    };

    describe('mouse event handlers', () => {
        test.each`
            event      | onSelectArgument
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

        test('should cancel the blur event', () => {
            const wrapper = getWrapper();

            wrapper.simulate('blur', mockEvent);

            expect(mockEvent.nativeEvent.stopImmediatePropagation).toHaveBeenCalled();
            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(mockEvent.stopPropagation).toHaveBeenCalled();
            expect(defaults.onSelect).not.toHaveBeenCalled();
        });
    });

    describe('render()', () => {
        test('should render the class name based on the isActive prop', () => {
            expect(getWrapper().hasClass('ba-RegionAnnotation')).toBe(true);
            expect(getWrapper({ isActive: true }).hasClass('is-active')).toBe(true);
            expect(getWrapper({ isActive: false }).hasClass('is-active')).toBe(false);
        });

        test('should render a RegionRect and pass it the provided shape', () => {
            const wrapper = getWrapper();

            expect(wrapper.prop('style')).toMatchObject({
                display: 'block',
                height: '10%',
                left: '10%',
                top: '10%',
                width: '10%',
            });
        });

        test('should pass the required props to the underlying anchor', () => {
            const wrapper = getWrapper({ className: 'ba-Test' });

            expect(wrapper.props()).toMatchObject({
                className: 'ba-RegionAnnotation ba-Test',
                onClick: expect.any(Function),
                type: 'button',
            });
        });

        test('should pass a noop method for onClick if not defined', () => {
            const wrapper = getWrapper({ onSelect: undefined });

            expect(wrapper.props()).toMatchObject({
                className: 'ba-RegionAnnotation',
                onClick: expect.any(Function),
                type: 'button',
            });
        });
    });
});
