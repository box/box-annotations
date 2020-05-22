import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import PopupReply, { Props } from '../PopupReply';
import ReplyForm from '../../ReplyForm';

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

    const getWrapper = (props = {}): ShallowWrapper => shallow(<PopupReply {...defaults} {...props} />);

    describe('render()', () => {
        test('should render the ReplyForm', () => {
            const wrapper = getWrapper();

            expect(wrapper.exists(ReplyForm)).toBe(true);
        });
    });
});
