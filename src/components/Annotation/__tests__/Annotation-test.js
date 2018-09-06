import * as React from 'react';
import { mount, shallow } from 'enzyme';

import { FormattedMessage } from 'react-intl';
import Annotation from '../Annotation';
import messages from '../messages';

const TIME_STRING_SEPT_27_2017 = '2017-09-27T10:40:41-07:00';

const USER = {
    type: 'user',
    id: '789ghi',
    name: 'Mia Thermopolis',
    email: 'princess@genovia.gov'
};

const annotation = {
    id: '123',
    createdAt: TIME_STRING_SEPT_27_2017,
    createdBy: USER,
    message: 'test',
    permissions: {}
};

describe('components/Annotation', () => {
    beforeEach(() => {});

    const render = (props = {}) => shallow(<Annotation {...annotation} {...props} />).dive();
    const deepRender = (props = {}) => mount(<Annotation {...annotation} {...props} />);

    test('should correctly render annotation', () => {
        const unixTime = new Date(TIME_STRING_SEPT_27_2017).getTime();

        const wrapper = render();

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('ReadableTime').prop('timestamp')).toEqual(unixTime);
        expect(wrapper.find('UserLink').prop('name')).toEqual(USER.name);
    });

    test('should correctly display anonymous username if no name was provided in createdBy', () => {
        const unknownUser = {
            type: 'user',
            id: '0'
        };
        const anonymousUserName = (
            <FormattedMessage className='ba-annotation-user-name' {...messages.anonymousUserName} />
        );
        const wrapper = render({ createdBy: unknownUser });
        expect(wrapper.find('UserLink').prop('name')).toEqual(anonymousUserName);
    });

    test('should not allow actions when annotation is pending', () => {
        const wrapper = render({
            onDelete: jest.fn(),
            permissions: { can_delete: true },
            isPending: true
        });
        expect(wrapper.find('InlineDelete').length).toEqual(0);
    });

    // eslint-disable-next-line
    test('should allow user to delete if they have delete permissions on the annotation and delete handler is defined', () => {
        const wrapper = render({ onDelete: jest.fn(), permissions: { can_delete: true } });
        expect(wrapper.find('InlineDelete').length).toEqual(1);
    });

    test('should not allow user to delete if they lack delete permissions on the annotation', () => {
        const wrapper = render({ onDelete: jest.fn() });
        expect(wrapper.find('InlineDelete').length).toEqual(0);
    });

    test('should not allow user to delete if onDelete handler is undefined', () => {
        const wrapper = render();
        expect(wrapper.find('InlineDelete').length).toEqual(0);
    });

    test('should render an error when one is defined', () => {
        const wrapper = render({
            onDelete: jest.fn(),
            error: {
                title: 'error',
                message: 'errorrrrr'
            }
        });

        expect(wrapper).toMatchSnapshot();
    });

    test('should render an error cta when an action is defined', () => {
        const onActionSpy = jest.fn();

        const wrapper = deepRender({
            onDelete: jest.fn(),
            error: {
                title: 'error',
                message: 'errorrrrr',
                action: {
                    text: 'click',
                    onAction: onActionSpy
                }
            }
        });

        const inlineErrorActionLink = wrapper.find('InlineError').find('PlainButton.lnk');
        expect(inlineErrorActionLink.length).toEqual(1);

        inlineErrorActionLink.simulate('click');

        expect(onActionSpy).toHaveBeenCalledTimes(1);
    });
});
