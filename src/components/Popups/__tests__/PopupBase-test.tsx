import React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { Instance } from '../Popper';
import PopupBase from '../PopupBase';

describe('PopupBase', () => {
    const defaults = {
        reference: document.createElement('div'),
    };
    const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
    };
    const Component = (): JSX.Element => <div>Test</div>;
    const getWrapper = (props = {}): ReactWrapper =>
        mount(
            <PopupBase {...defaults} {...props}>
                <Component />
            </PopupBase>,
        );

    describe('event handlers', () => {
        test.each(['click', 'mouseDown', 'mouseMove', 'mouseUp', 'touchMove', 'touchStart'])(
            'should cancel any %s event that occurs inside the popup',
            event => {
                const wrapper = getWrapper();

                wrapper.simulate(event, mockEvent);

                expect(mockEvent.stopPropagation).toHaveBeenCalled();
            },
        );
    });

    describe('componentDidMount()', () => {
        test('should create a popper instance', () => {
            const wrapper = getWrapper();
            const instance = wrapper.instance() as InstanceType<typeof PopupBase>;

            expect(instance.popper).toBeDefined();
        });
    });

    describe('componentDidUpdate()', () => {
        test('should call setOptions if the options object changes', () => {
            const wrapper = getWrapper();
            const instance = wrapper.instance() as InstanceType<typeof PopupBase>;

            wrapper.setProps({ options: { placement: 'left' } });

            expect(instance.popper && instance.popper.setOptions).toHaveBeenCalled();
        });

        test('should call recreate the popper if the reference element changes', () => {
            const wrapper = getWrapper();
            const instance = wrapper.instance() as InstanceType<typeof PopupBase>;
            const oldPopper = instance.popper as Instance;

            wrapper.setProps({ reference: document.createElement('div') });

            expect(oldPopper.destroy).toHaveBeenCalled();
            expect(instance.popper).toBeDefined();
            expect(instance.popper).not.toEqual(oldPopper);
        });
    });

    describe('componentWillUnmount()', () => {
        test('should destroy the popper instance if it exists', () => {
            const wrapper = getWrapper();
            const instance = wrapper.instance() as InstanceType<typeof PopupBase>;

            wrapper.unmount();

            expect(instance.popper && instance.popper.destroy).toHaveBeenCalled();
        });
    });

    describe('render()', () => {
        test('should render the popup', () => {
            const wrapper = getWrapper();

            expect(wrapper.children().hasClass('ba-Popup')).toBe(true);
            expect(wrapper.exists(Component)).toBe(true);
        });
    });
});
