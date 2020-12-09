import React from 'react';
import IconTrash from 'box-ui-elements/es/icon/line/Trash16';
import { FormattedMessage } from 'react-intl';
import { shallow, ShallowWrapper } from 'enzyme';
import messages from '../messages';
import PopupBase from '../PopupBase';
import PopupDrawingToolbar, { Props } from '../PopupDrawingToolbar';

describe('PopupDrawingToolbar', () => {
    const getDOMRect = (x = 0, y = 0, height = 1000, width = 1000): DOMRect => ({
        bottom: y + height,
        top: y,
        left: x,
        right: x + width,
        height,
        width,
        toJSON: jest.fn(),
        x,
        y,
    });
    const getDefaults = (): Props => ({
        onDelete: jest.fn(),
        onReply: jest.fn(),
        reference: { getBoundingClientRect: () => getDOMRect() },
    });
    const getWrapper = (props?: Partial<Props>): ShallowWrapper =>
        shallow(<PopupDrawingToolbar {...getDefaults()} {...props} />);

    describe('render', () => {
        test('should render popup and buttons', () => {
            const wrapper = getWrapper({ className: 'foo' });

            expect(wrapper.find(PopupBase).props()).toMatchObject({
                className: 'foo ba-PopupDrawingToolbar',
                'data-resin-component': 'popupDrawingToolbar',
            });

            // Delete button
            expect(wrapper.find('[data-testid="ba-PopupDrawingToolbar-delete"]').props()).toMatchObject({
                className: 'ba-PopupDrawingToolbar-delete',
                'data-testid': 'ba-PopupDrawingToolbar-delete',
                onClick: expect.any(Function),
                title: 'Delete Drawing',
                type: 'button',
            });
            expect(wrapper.exists(IconTrash)).toBe(true);

            // Add comment button
            expect(wrapper.find('[data-testid="ba-PopupDrawingToolbar-comment"]').props()).toMatchObject({
                className: 'ba-PopupDrawingToolbar-comment',
                'data-testid': 'ba-PopupDrawingToolbar-comment',
                onClick: expect.any(Function),
                type: 'button',
            });
            expect(wrapper.find(FormattedMessage).props()).toMatchObject(messages.buttonAddComent);
        });
    });

    describe('callbacks', () => {
        test.each`
            callback      | button
            ${'onDelete'} | ${'ba-PopupDrawingToolbar-delete'}
            ${'onReply'}  | ${'ba-PopupDrawingToolbar-comment'}
        `('should call $callback when $button is clicked', ({ callback, button }) => {
            const mockFn = jest.fn();
            const wrapper = getWrapper({ [callback]: mockFn });

            wrapper.find(`[data-testid="${button}"]`).simulate('click');

            expect(mockFn).toHaveBeenCalled();
        });
    });
});
