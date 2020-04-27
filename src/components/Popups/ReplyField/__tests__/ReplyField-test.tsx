import React from 'react';
import { EditorState } from 'draft-js';
import { shallow, ShallowWrapper } from 'enzyme';
import ReplyField, { Props } from '../ReplyField';

describe('components/Popups/ReplyField', () => {
    const defaults: Props = {
        className: 'ba-Popup-field',
        editorState: EditorState.createEmpty(),
        isDisabled: false,
        onChange: jest.fn(),
        onClick: jest.fn(),
        value: '',
    };

    const getWrapper = (props = {}): ShallowWrapper => shallow(<ReplyField {...defaults} {...props} />);

    describe('render()', () => {
        test('should render the editor with right props', () => {
            const wrapper = getWrapper();

            expect(wrapper.prop('className')).toBe('ba-Popup-field ba-ReplyField');
        });
    });
});
