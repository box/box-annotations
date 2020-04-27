import React from 'react';
import { EditorState } from 'draft-js';
import { mount, ReactWrapper } from 'enzyme';
import ReplyField, { Props } from '../ReplyField';

describe('components/Popups/ReplyField', () => {
    const defaults: Props = {
        className: 'ba-Popup-field',
        editorState: EditorState.createEmpty(),
        isDisabled: false,
        onChange: jest.fn(),
    };

    const getWrapper = (props = {}): ReactWrapper => mount(<ReplyField {...defaults} {...props} />);

    describe('render()', () => {
        test('should render the editor with right props', () => {
            const wrapper = getWrapper();
            // wrapper's first level is ForwardRef(ReplyField)
            expect(wrapper.childAt(0).prop('className')).toBe('ba-Popup-field ba-ReplyField');
        });
    });
});
