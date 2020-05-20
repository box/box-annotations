import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount, ReactWrapper } from 'enzyme';
import PopupCursor from '../PopupCursor';
import PopupBase from '../PopupBase';

describe('components/Popups/PopupCursor', () => {
    // Render helpers
    const getWrapper = (props = {}): ReactWrapper => mount(<PopupCursor {...props} />);

    beforeEach(() => {
        jest.spyOn(document, 'addEventListener');
        jest.spyOn(document, 'removeEventListener');
    });

    describe('mouse events', () => {
        test('should set virtualElement rect', () => {
            const wrapper = getWrapper();

            act(() => {
                document.dispatchEvent(new MouseEvent('mousemove', { clientX: 1, clientY: 2 }));
            });

            const newVirtualElement = wrapper.find(PopupBase).prop('reference');
            const rect = newVirtualElement.getBoundingClientRect();

            expect(rect.left).toEqual(1);
            expect(rect.top).toEqual(2);
        });
    });

    describe('render()', () => {
        test('should add eventListener when render and remove when unmount', () => {
            const wrapper = getWrapper();
            expect(document.addEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));

            wrapper.unmount();
            expect(document.removeEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));
        });
    });
});
