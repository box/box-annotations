import React from 'react';
import { EditorState } from 'draft-js';
import { Form } from 'formik';
import { KEYS } from 'box-ui-elements/es/constants';
import { shallow, ShallowWrapper } from 'enzyme';
import ReplyButton from '../ReplyButton';
import ReplyForm, { Props } from '../ReplyForm';
import ReplyField from '../../ReplyField';
import { mockEvent } from '../../../common/__mocks__/events';

jest.mock('box-ui-elements/es/components/form-elements/draft-js-mention-selector/utils', () => ({
    getFormattedCommentText: jest.fn().mockReturnValue({ text: 'foo' }),
}));

describe('components/ReplyForm/ReplyForm', () => {
    const mockEditorState = EditorState.createEmpty();
    const defaults: Props = {
        cursorPosition: 0,
        errors: {},
        fileId: '0',
        isCurrentFileVersion: true,
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
    const mockAddEventListener = jest.fn();

    const getWrapper = (props = {}): ShallowWrapper<Props, undefined> =>
        shallow(<ReplyForm {...defaults} {...props} />);

    beforeEach(() => {
        jest.spyOn(React, 'useRef').mockImplementation(() => ({ current: { addEventListener: mockAddEventListener } }));
        jest.spyOn(React, 'useEffect').mockImplementation(func => func());
    });

    test('should call add keydown event listener', () => {
        getWrapper();

        expect(mockAddEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    test('should render Form with ReplyField and buttons in the footer', () => {
        const wrapper = getWrapper();

        expect(wrapper.exists(Form)).toBe(true);
        expect(wrapper.exists(ReplyField)).toBe(true);
        expect(wrapper.find(ReplyButton).length).toBe(2);
    });

    test('should disable the buttons and form if isPending is true', () => {
        const wrapper = getWrapper({ isPending: true });
        const cancel = wrapper.find(ReplyButton).at(0);
        const submit = wrapper.find(ReplyButton).at(1);

        expect(wrapper.find(ReplyField).prop('isDisabled')).toBe(true);
        expect(cancel.prop('isDisabled')).toBe(true);
        expect(submit.prop('isDisabled')).toBe(true);
    });

    test('should disable the submit button if the form has errors', () => {
        const wrapper = getWrapper({ errors: { foo: 'bar' } });
        const cancel = wrapper.find(ReplyButton).at(0);
        const submit = wrapper.find(ReplyButton).at(1);

        expect(cancel.prop('isDisabled')).toBe(false);
        expect(submit.prop('isDisabled')).toBe(true);
    });

    test('should call the handleChange callback when change event occurs on ReplyField', () => {
        const wrapper = getWrapper();

        wrapper.find(ReplyField).simulate('change', mockEditorState);

        expect(defaults.onChange).toHaveBeenCalledWith('foo');
        expect(defaults.setFieldValue).toHaveBeenCalledWith('editorState', mockEditorState);
    });

    describe.skip('event handlers', () => {
        test.each`
            key            | callCount
            ${KEYS.enter}  | ${0}
            ${KEYS.escape} | ${1}
            ${KEYS.space}  | ${0}
        `('should handle the $key keydown event', ({ callCount, key }) => {
            const wrapper = getWrapper();

            wrapper.find(Form).simulate('keyDown', { ...mockEvent, key });

            expect(mockEvent.preventDefault).toHaveBeenCalledTimes(callCount);
            expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(callCount);
            expect(defaults.onCancel).toHaveBeenCalledTimes(callCount);
        });
    });
});
