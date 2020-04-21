import React from 'react';
import { KEYS } from 'box-ui-elements/es/constants';
import { shallow, ShallowWrapper } from 'enzyme';
import PopupBase from '../PopupBase';
import PopupReply, { Props } from '../PopupReply';

jest.mock('../PopupBase', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }): JSX.Element => <div>{children}</div>,
}));

type PropsIndex = {
    [key: string]: Function | HTMLElement;
};

describe('components/Popups/PopupReply', () => {
    const defaults: Props & PropsIndex = {
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
    const mockTextarea = { focus: jest.fn(), value: '' };
    const getWrapper = (props = {}): ShallowWrapper => shallow(<PopupReply {...defaults} {...props} />);

    beforeEach(() => {
        jest.spyOn(React, 'useRef').mockReturnValueOnce({ current: mockTextarea });
        jest.spyOn(React, 'useState').mockImplementation(() => ['', jest.fn()]);
    });

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

        test('should handle the textarea onChange event', () => {
            const wrapper = getWrapper();
            const textarea = wrapper.find(`[data-testid="ba-Popup-text"]`);

            textarea.simulate('change', { target: { value: 'test' } });

            expect(defaults.onChange).toHaveBeenCalledWith('test');
        });

        test('should focus the textarea when the underlying popup mounts', () => {
            const wrapper = getWrapper();
            const update = wrapper.find(PopupBase).prop('options').onFirstUpdate as Function;

            expect(mockTextarea.focus).not.toHaveBeenCalled();

            update({});

            expect(mockTextarea.focus).toHaveBeenCalled();
        });
    });

    describe('render()', () => {
        test('should render the popup textarea and footer buttons', () => {
            const wrapper = getWrapper();

            expect(wrapper.exists('[data-testid="ba-Popup-cancel"]')).toBe(true);
            expect(wrapper.exists('[data-testid="ba-Popup-submit"]')).toBe(true);
            expect(wrapper.exists('[data-testid="ba-Popup-text"]')).toBe(true);
        });
    });
});
