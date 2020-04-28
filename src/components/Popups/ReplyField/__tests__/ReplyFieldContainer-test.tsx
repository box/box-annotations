import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import ReplyField from '../ReplyField';
import ReplyFieldContainer, { Props } from '../ReplyFieldContainer';
import { createStore } from '../../../../store';

jest.mock('../ReplyField');

describe('components/Popups/ReplyFieldContainer', () => {
    const defaults = {
        cursorPosition: 0,
        onChange: jest.fn(),
        onClick: jest.fn(),
        store: createStore(),
    };
    const getWrapper = (props = {}): ReactWrapper<Props> => mount(<ReplyFieldContainer {...defaults} {...props} />);

    describe('render', () => {
        test('should connect the underlying component', () => {
            const wrapper = getWrapper();

            expect(wrapper.find(ReplyField).props()).toMatchObject({
                cursorPosition: defaults.cursorPosition,
                onChange: defaults.onChange,
                onClick: defaults.onClick,
                store: defaults.store,
            });
        });
    });
});
