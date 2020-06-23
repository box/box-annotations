import * as React from 'react';
import * as ReactPopper from 'react-popper';
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

describe('components/Popups/PopupReply', () => {
    const defaults: Props = {
        isPending: false,
        onCancel: jest.fn(),
        onChange: jest.fn(),
        onSubmit: jest.fn(),
        reference: document.createElement('div'),
    };
    const getWrapper = (props = {}): ReactWrapper => mount(<PopupReply {...defaults} {...props} />);
    const popperInstance = {
        attributes: { popper: { 'data-placement': 'bottom' } },
        update: jest.fn(),
        styles: { popper: { top: '10px' } },
    };
    const popperSpy = jest.spyOn(ReactPopper, 'usePopper') as jest.Mock;

    beforeEach(() => {
        popperSpy.mockReturnValue(popperInstance);
        jest.spyOn(React, 'useEffect').mockImplementation(f => f());
    });

    describe('state changes', () => {
        test('should call update on the underlying popper instance when the store changes', () => {
            const reduxSpy = jest.spyOn(ReactRedux, 'useSelector').mockImplementation(() => false);
            const wrapper = getWrapper();

            reduxSpy.mockReturnValueOnce(true);
            wrapper.setProps({ value: '1' });

            reduxSpy.mockReturnValueOnce(false);
            wrapper.setProps({ value: '2' });

            expect(popperInstance.update).toHaveBeenCalledTimes(3);
        });
    });

    describe('render()', () => {
        test('should render the ReplyForm with a popper instance', () => {
            jest.spyOn(ReactRedux, 'useSelector').mockImplementation(() => false);

            const wrapper = getWrapper();

            expect(wrapper.exists(PopupBase)).toBe(true);
            expect(wrapper.exists(ReplyForm)).toBe(true);
        });

        test('should call usePopper with the reference and pass its attributes to the popup', () => {
            const wrapper = getWrapper();
            const popup = wrapper.find(PopupBase);

            expect(ReactPopper.usePopper).toHaveBeenCalledWith(
                defaults.reference,
                expect.any(Object),
                expect.any(Object),
            );
            expect(popup.props()).toMatchObject({
                attributes: popperInstance.attributes,
                styles: popperInstance.styles,
            });
        });
    });
});
