import React from 'react';
import { KEYS } from 'box-ui-elements/es/constants';
import { shallow, ShallowWrapper } from 'enzyme';
import PopupReply, { Props } from '../PopupReply';
import ReplyForm from '../../ReplyForm';

jest.mock('../PopupBase', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }): JSX.Element => <div>{children}</div>,
}));

type PropsIndex = {
    [key: string]: Function | HTMLElement;
};

describe('PopupReply', () => {
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
    });

    describe('event handlers', () => {
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
    });

    describe('render()', () => {
        test('should render the popup textarea and footer buttons', () => {
            const wrapper = getWrapper();

            expect(wrapper.exists(ReplyForm)).toBe(true);
        });
    });
});
