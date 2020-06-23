import React from 'react';
import * as ReactPopper from 'react-popper';
import { act } from 'react-dom/test-utils';
import { mount, ReactWrapper } from 'enzyme';
import PopupCursor from '../PopupCursor';

describe('components/Popups/PopupCursor', () => {
    const getWrapper = (props = {}): ReactWrapper => mount(<PopupCursor {...props} />);
    const popperInstance = {
        attributes: { popper: { 'data-placement': 'bottom' } },
        update: jest.fn(),
        styles: { popper: { top: '10px' } },
    };
    const popperSpy = jest.spyOn(ReactPopper, 'usePopper') as jest.Mock;

    beforeEach(() => {
        jest.spyOn(document, 'addEventListener');
        jest.spyOn(document, 'removeEventListener');

        popperSpy.mockReturnValue(popperInstance);
    });

    describe('mousemove handler', () => {
        test('should call update on the underlying popper instance', () => {
            getWrapper();

            act(() => {
                document.dispatchEvent(new MouseEvent('mousemove', { clientX: 1, clientY: 2 }));
            });

            expect(popperInstance.update).toHaveBeenCalled();
        });
    });

    describe('render()', () => {
        test('should add eventListener when render and remove when unmount', () => {
            const wrapper = getWrapper();
            expect(document.addEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));

            wrapper.unmount();
            expect(document.removeEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));
        });

        test('should call usePopper with the reference and pass its attributes to the popup', () => {
            const reference = { getBoundingClientRect: expect.any(Function) };
            const wrapper = getWrapper();
            const popup = wrapper.find('[data-testid="ba-PopupCursor"]');

            expect(ReactPopper.usePopper).toHaveBeenCalledWith(reference, popup.getDOMNode(), expect.any(Object));
            expect(popup.prop('data-placement')).toEqual('bottom');
            expect(popup.prop('style')).toMatchObject({ top: '10px' });
        });
    });
});
