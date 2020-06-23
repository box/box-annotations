import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import PopupBase from '../PopupBase';

describe('PopupBase', () => {
    const defaults = {
        reference: document.createElement('div'),
    };
    const mockEvent = {
        nativeEvent: {
            stopImmediatePropagation: jest.fn(),
        },
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
    };
    const Component = (): JSX.Element => <div>Test</div>;
    const getWrapper = (props = {}): ShallowWrapper =>
        shallow(
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

                expect(mockEvent.nativeEvent.stopImmediatePropagation).toHaveBeenCalled();
                expect(mockEvent.stopPropagation).toHaveBeenCalled();
            },
        );
    });

    describe('render()', () => {
        test('should render the popup', () => {
            const wrapper = getWrapper();

            expect(wrapper.hasClass('ba-Popup')).toBe(true);
            expect(wrapper.exists(Component)).toBe(true);
        });
    });
});
