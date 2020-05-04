import React from 'react';
import { KEYS } from 'box-ui-elements/es/constants';
import { shallow, ShallowWrapper } from 'enzyme';
import PopupReply, { Props } from '../PopupReply';

jest.mock('../PopupBase', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }): JSX.Element => <div>{children}</div>,
}));

type PropsIndex = {
    [key: string]: Function | HTMLElement | boolean;
};

describe('components/Popups/PopupReply', () => {
    const defaults: Props & PropsIndex = {
        isPending: false,
        onCancel: jest.fn(),
        onChange: jest.fn(),
        onSubmit: jest.fn(),
        reference: document.createElement('div'),
    };
    const mockEvent = {
        nativeEvent: {
            stopImmediatePropagation: jest.fn(),
        },
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
    };
    const getWrapper = (props = {}): ShallowWrapper => shallow(<PopupReply {...defaults} {...props} />);

    describe('event handlers', () => {
        test.each`
            testId               | event       | callback
            ${'ba-Popup-cancel'} | ${'click'}  | ${'onCancel'}
            ${'ba-Popup-form'}   | ${'submit'} | ${'onSubmit'}
        `('should cancel the $testId button $event event', ({ callback, event, testId }) => {
            const wrapper = getWrapper();
            const button = wrapper.find(`[data-testid="${testId}"]`);

            button.simulate(event, mockEvent);

            expect(mockEvent.nativeEvent.stopImmediatePropagation).toHaveBeenCalled();
            expect(mockEvent.stopPropagation).toHaveBeenCalled();
            expect(defaults[callback]).toHaveBeenCalled();
        });

        test.each`
            key            | callCount
            ${KEYS.enter}  | ${0}
            ${KEYS.escape} | ${1}
            ${KEYS.space}  | ${0}
        `('should handle the $key keydown event', ({ callCount, key }) => {
            const wrapper = getWrapper();

            wrapper.simulate('keyDown', { ...mockEvent, key });

            expect(mockEvent.nativeEvent.stopImmediatePropagation).toHaveBeenCalledTimes(callCount);
            expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(callCount);
            expect(defaults.onCancel).toHaveBeenCalledTimes(callCount);
        });

        test('should handle the onChange event', () => {
            const wrapper = getWrapper();
            const editor = wrapper.find(`[data-testid="ba-Popup-field"]`);

            editor.simulate('change', 'test');

            expect(defaults.onChange).toHaveBeenCalledWith('test');
        });
    });

    describe('render()', () => {
        test('should render the popup editor and footer buttons', () => {
            const wrapper = getWrapper();

            expect(wrapper.exists('[data-testid="ba-Popup-cancel"]')).toBe(true);
            expect(wrapper.exists('[data-testid="ba-Popup-submit"]')).toBe(true);
            expect(wrapper.exists('[data-testid="ba-Popup-field"]')).toBe(true);
        });

        test.each([undefined, 'Test'])('should disable post button if value is %s', value => {
            const wrapper = getWrapper({ value });
            expect(wrapper.find('[data-testid="ba-Popup-submit"]').prop('isDisabled')).toBe(value === undefined);
        });

        test.each([true, false])('should disable/enable buttons and editor when isPending %s', isPending => {
            const wrapper = getWrapper({ isPending, value: 'Test' });

            expect(wrapper.find('[data-testid="ba-Popup-cancel"]').prop('isDisabled')).toBe(isPending);
            expect(wrapper.find('[data-testid="ba-Popup-submit"]').prop('isDisabled')).toBe(isPending);
            expect(wrapper.find('[data-testid="ba-Popup-field"]').prop('isDisabled')).toBe(isPending);
        });
    });
});
