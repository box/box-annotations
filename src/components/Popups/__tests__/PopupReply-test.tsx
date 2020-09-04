import * as React from 'react';
import * as ReactRedux from 'react-redux';
import { mount, ReactWrapper } from 'enzyme';
import PopupBase from '../PopupBase';
import PopupReply, { Props } from '../PopupReply';
import ReplyForm from '../../ReplyForm';

jest.mock('react-redux', () => ({
    useSelector: jest.fn(),
}));

jest.mock('../PopupBase');
jest.mock('../../ReplyForm');
jest.mock('../../../common/usePreventEventPropagationRef');

describe('PopupReply', () => {
    const defaults: Props = {
        isPending: false,
        onCancel: jest.fn(),
        onChange: jest.fn(),
        onSubmit: jest.fn(),
        reference: document.createElement('div'),
    };

    const getWrapper = (props = {}): ReactWrapper => mount(<PopupReply {...defaults} {...props} />);

    beforeEach(() => {
        jest.spyOn(React, 'useEffect').mockImplementation(f => f());
    });

    describe('state changes', () => {
        test('should call update on the underlying popper instance when the store changes', () => {
            const popupMock = { popper: { update: jest.fn() } };
            const reduxSpy = jest.spyOn(ReactRedux, 'useSelector').mockImplementation(() => false);
            const refSpy = jest.spyOn(React, 'useRef').mockImplementation(() => ({ current: popupMock }));
            const wrapper = getWrapper();

            reduxSpy.mockReturnValueOnce(true);
            wrapper.setProps({ value: '1' });

            reduxSpy.mockReturnValueOnce(false);
            wrapper.setProps({ value: '2' });

            expect(refSpy).toHaveBeenCalled();
            expect(popupMock.popper.update).toHaveBeenCalledTimes(3);
        });
    });

    describe('render()', () => {
        test('should render the ReplyForm', () => {
            const wrapper = getWrapper();

            expect(wrapper.exists(PopupBase)).toBe(true);
            expect(wrapper.exists(ReplyForm)).toBe(true);
        });
    });
});
