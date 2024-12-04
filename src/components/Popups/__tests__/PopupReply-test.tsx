import React from 'react';
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

        test('should maintain referential integrity of the PopupBase options object across renders', () => {
            const wrapper = getWrapper();

            const popupOptions = wrapper.find(PopupBase).prop('options');

            expect(wrapper.exists(PopupBase)).toBe(true);
            expect(wrapper.find(ReplyForm).prop('value')).toBe('');

            wrapper.setProps({ value: '1' });

            expect(wrapper.find(PopupBase).prop('options')).toStrictEqual(popupOptions);
            expect(wrapper.find(ReplyForm).prop('value')).toBe('1');
        });
    });

    describe('Popup options', () => {
        const eventListenersModifier = {
            name: 'eventListeners',
            options: { scroll: false },
        };
        const IEUserAgent = 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko';
        const otherUserAgent = 'Other';

        test.each`
            userAgent         | expectedPlacement
            ${IEUserAgent}    | ${'top'}
            ${otherUserAgent} | ${'bottom'}
        `(
            'should set placement option as $expectedPlacement based on userAgent=$userAgent',
            ({ userAgent, expectedPlacement }) => {
                global.window.navigator.userAgent = userAgent;

                const wrapper = getWrapper();

                expect(window.navigator.userAgent).toEqual(userAgent);
                expect(wrapper.find(PopupBase).prop('options').placement).toBe(expectedPlacement);
            },
        );

        test('should disable scroll event listeners if browser is IE', () => {
            global.window.navigator.userAgent = IEUserAgent;

            const wrapper = getWrapper();

            expect(window.navigator.userAgent).toEqual(IEUserAgent);
            expect(wrapper.find(PopupBase).prop('options').modifiers).toContainEqual(eventListenersModifier);
        });

        test('should not disable scroll event listeners for non IE browsers', () => {
            global.window.navigator.userAgent = otherUserAgent;

            const wrapper = getWrapper();

            expect(window.navigator.userAgent).toEqual(otherUserAgent);
            expect(wrapper.find(PopupBase).prop('options').modifiers).not.toContainEqual(eventListenersModifier);
        });
    });
});
