import * as React from 'react';
import Button from 'box-ui-elements/es/components/button';
import PrimaryButton from 'box-ui-elements/es/components/primary-button';
import { EditorState } from 'draft-js';
import { Form } from 'formik';
import { KEYS } from 'box-ui-elements/es/constants';
import { shallow, ShallowWrapper } from 'enzyme';
import ReplyForm, { Props } from '../ReplyForm';
import ReplyField from '../../ReplyField';
import { mockEvent } from '../../../common/__mocks__/events';

jest.mock('box-ui-elements/es/components/form-elements/draft-js-mention-selector', () => ({
    getFormattedCommentText: jest.fn().mockReturnValue({ text: 'foo' }),
}));

describe('components/ReplyForm/ReplyForm', () => {
    const mockEditorState = EditorState.createEmpty();
    const defaults: Props = {
        cursorPosition: 0,
        errors: {},
        isPending: false,
        onCancel: jest.fn(),
        onChange: jest.fn(),
        onSubmit: jest.fn(),
        setFieldValue: jest.fn(),
        value: 'test',
        values: {
            editorState: mockEditorState,
        },
    };

    const getWrapper = (props = {}): ShallowWrapper<Props, undefined> =>
        shallow(<ReplyForm {...defaults} {...props} />);

    test('should render Form with ReplyField and Buttons in the footer', () => {
        const wrapper = getWrapper();

        expect(wrapper.exists(Form)).toBe(true);
        expect(wrapper.exists(ReplyField)).toBe(true);
        expect(wrapper.exists(Button)).toBe(true);
        expect(wrapper.exists(PrimaryButton)).toBe(true);
    });

    test('should have buttons be disabled if isPending is true', () => {
        const wrapper = getWrapper({ isPending: true });

        expect(wrapper.find(ReplyField).prop('isDisabled')).toBe(true);
        expect(wrapper.find(Button).prop('isDisabled')).toBe(true);
        expect(wrapper.find(PrimaryButton).prop('isDisabled')).toBe(true);
    });

    test('should disable PrimaryButton if has errors', () => {
        const wrapper = getWrapper({ errors: { foo: 'bar' } });

        expect(wrapper.find(Button).prop('isDisabled')).toBe(false);
        expect(wrapper.find(PrimaryButton).prop('isDisabled')).toBe(true);
    });

    test('should call the handleChange callback when change event occurs on ReplyField', () => {
        const wrapper = getWrapper();

        wrapper.find(ReplyField).simulate('change', mockEditorState);

        expect(defaults.onChange).toHaveBeenCalledWith('foo');
        expect(defaults.setFieldValue).toHaveBeenCalledWith('editorState', mockEditorState);
    });

    describe('event handlers', () => {
        test.each`
            key            | callCount
            ${KEYS.enter}  | ${0}
            ${KEYS.escape} | ${1}
            ${KEYS.space}  | ${0}
        `('should handle the $key keydown event', ({ callCount, key }) => {
            const wrapper = getWrapper();

            wrapper.find(Form).simulate('keyDown', { ...mockEvent, key });

            expect(mockEvent.nativeEvent.stopImmediatePropagation).toHaveBeenCalledTimes(callCount);
            expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(callCount);
            expect(defaults.onCancel).toHaveBeenCalledTimes(callCount);
        });
    });
});
