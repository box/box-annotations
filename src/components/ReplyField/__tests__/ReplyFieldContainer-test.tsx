import * as React from 'react';
import { EditorState } from 'draft-js';
import { mount, ReactWrapper } from 'enzyme';
import ReplyField from '../ReplyField';
import ReplyFieldContainer, { Props } from '../ReplyFieldContainer';
import { createStore } from '../../../store';

jest.mock('../ReplyField');

describe('ReplyFieldContainer', () => {
    const store = createStore({
        creator: {
            cursor: 0,
        },
    });
    const defaults = {
        editorState: EditorState.createEmpty(),
        onChange: jest.fn(),
        onClick: jest.fn(),
        store,
    };

    const getWrapper = (props = {}): ReactWrapper<Props> => mount(<ReplyFieldContainer {...defaults} {...props} />);

    describe('render', () => {
        test('should connect the underlying component', () => {
            const wrapper = getWrapper();

            expect(wrapper.find(ReplyField).props()).toMatchObject({
                cursorPosition: 0,
                onChange: defaults.onChange,
                onClick: defaults.onClick,
            });
        });
    });
});
