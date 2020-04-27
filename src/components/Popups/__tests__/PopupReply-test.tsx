import React from 'react';
import { KEYS } from 'box-ui-elements/es/constants';
import { EditorState } from 'draft-js';
import { shallow, ShallowWrapper } from 'enzyme';
import PopupBase from '../PopupBase';
import PopupReply, { Props } from '../PopupReply';

jest.mock('../PopupBase', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }): JSX.Element => <div>{children}</div>,
}));

jest.mock('react-intl', () => {
    const reactIntl = require.requireActual('react-intl');
    const intl = reactIntl.createIntl({
        locale: 'en',
    });

    return {
        ...reactIntl,
        useIntl: () => intl,
    };
});

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
    const mockEditor = { focus: jest.fn() };
    const getWrapper = (props = {}): ShallowWrapper => shallow(<PopupReply {...defaults} {...props} />);

    beforeEach(() => {
        jest.spyOn(React, 'useRef').mockReturnValueOnce({ current: mockEditor });
        jest.spyOn(React, 'useState').mockImplementation(() => [EditorState.createEmpty(), jest.fn()]);
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

        test('should handle the editor onChange event', () => {
            const wrapper = getWrapper();
            const editor = wrapper.find(`[data-testid="ba-Popup-field"]`);

            editor.simulate('change', {
                getCurrentContent: jest.fn().mockReturnValue({ getPlainText: jest.fn().mockReturnValue('test') }),
            });

            expect(defaults.onChange).toHaveBeenCalledWith('test');
        });

        test('should focus the editor when the underlying popup mounts', () => {
            const wrapper = getWrapper();
            const update = wrapper.find(PopupBase).prop('options').onFirstUpdate as Function;
            // wrapper.editorState.getCurrentConent = jest.fn();
            expect(mockEditor.focus).not.toHaveBeenCalled();

            update({});

            expect(mockEditor.focus).toHaveBeenCalled();
        });
    });

    describe('render()', () => {
        test('should render the popup editor and footer buttons', () => {
            const wrapper = getWrapper();

            expect(wrapper.exists('[data-testid="ba-Popup-cancel"]')).toBe(true);
            expect(wrapper.exists('[data-testid="ba-Popup-submit"]')).toBe(true);
            expect(wrapper.exists('[data-testid="ba-Popup-field"]')).toBe(true);
        });

        test.each([true, false])('should disable/enable buttons and editor when isPending %s', isPending => {
            const wrapper = getWrapper({ isPending });

            expect(wrapper.find('[data-testid="ba-Popup-cancel"]').prop('isDisabled')).toBe(isPending);
            expect(wrapper.find('[data-testid="ba-Popup-submit"]').prop('isDisabled')).toBe(isPending);
            expect(wrapper.find('[data-testid="ba-Popup-field"]').prop('isDisabled')).toBe(isPending);
        });
    });
});
