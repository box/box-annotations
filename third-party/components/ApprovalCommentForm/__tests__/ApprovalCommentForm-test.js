/* eslint-disable no-unused-expressions */
import * as React from 'react';
import { shallow } from 'enzyme';
import noop from 'lodash/noop';

import ApprovalCommentForm from '../ApprovalCommentForm';

const fn = jest.fn();

describe('third-party/components/ApprovalCommentForm', () => {
    const render = (props = {}) =>
        shallow(
            <ApprovalCommentForm
                user={null}
                isOpen={false}
                isEditing={true}
                createComment={fn}
                onCancel={fn}
                onSubmit={noop}
                onFocus={fn}
                getAvatarUrl={noop}
                {...props}
            />
        );

    test('should correctly render empty form', () => {
        const wrapper = render();
        expect(wrapper).toMatchSnapshot();
    });

    test('should render commentText value in textarea', () => {
        const wrapper = render().dive();

        wrapper.instance().onFormChangeHandler({ commentText: 'something' });
        wrapper.update();

        expect(wrapper.find('.bcs-comment-input').props().value).toEqual('something');
    });

    test('should return translated error message on invalid textarea message', () => {
        const intl = { formatMessage: jest.fn() };
        const wrapper = render({ intl }).dive();
        const instance = wrapper.instance();

        expect(instance.validateTextArea('peanuts')).toBeNull();
        expect(instance.validateTextArea('    ')).not.toBeNull();
    });
});
