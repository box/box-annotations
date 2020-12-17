import * as React from 'react';
import IconRedo from 'box-ui-elements/es/icon/line/Redo16';
import IconTrash from 'box-ui-elements/es/icon/line/Trash16';
import IconUndo from 'box-ui-elements/es/icon/line/Undo16';
import { FormattedMessage } from 'react-intl';
import { mount, ReactWrapper } from 'enzyme';
import messages from '../messages';
import PopupBase from '../PopupBase';
import PopupDrawingToolbar, { Props } from '../PopupDrawingToolbar';

jest.mock('../PopupBase');

describe('PopupDrawingToolbar', () => {
    const getDataTestId = (button: string): string => `ba-PopupDrawingToolbar-${button}`;
    const getButton = (wrapper: ReactWrapper, button: string): ReactWrapper =>
        wrapper.find(`[data-testid="${getDataTestId(button)}"]`);
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
        canComment: true,
        canRedo: false,
        canUndo: false,
        drawnPathGroups: [],
        onDelete: jest.fn(),
        onRedo: jest.fn(),
        onReply: jest.fn(),
        onUndo: jest.fn(),
        reference: { getBoundingClientRect: () => getDOMRect() },
    });

    const popupMock = { popper: { update: jest.fn() } };

    const getWrapper = (props = {}): ReactWrapper => mount(<PopupDrawingToolbar {...getDefaults()} {...props} />);

    beforeEach(() => {
        jest.spyOn(React, 'useEffect').mockImplementation(f => f());
        jest.spyOn(React, 'useRef').mockImplementation(() => ({ current: popupMock }));
    });

    describe('state changes', () => {
        test('should call update on the underlying popper instance when the drawnPathGroups changes', () => {
            const wrapper = getWrapper({ drawnPathGroups: {} });

            wrapper.setProps({ drawnPathGroups: [{}, {}] });

            expect(popupMock.popper.update).toHaveBeenCalledTimes(1);
        });
    });

    describe('render', () => {
        test('should render popup and buttons', () => {
            const wrapper = getWrapper({ className: 'foo' });

            expect(wrapper.find(PopupBase).props()).toMatchObject({
                className: 'foo ba-PopupDrawingToolbar',
                'data-resin-component': 'popupDrawingToolbar',
            });

            // Undo button
            expect(getButton(wrapper, 'undo').props()).toMatchObject({
                className: 'ba-PopupDrawingToolbar-undo',
                'data-testid': 'ba-PopupDrawingToolbar-undo',
                disabled: true,
                onClick: expect.any(Function),
                title: 'Undo',
                type: 'button',
            });
            expect(wrapper.exists(IconUndo)).toBe(true);

            // Redo button
            expect(getButton(wrapper, 'redo').props()).toMatchObject({
                className: 'ba-PopupDrawingToolbar-redo',
                'data-testid': 'ba-PopupDrawingToolbar-redo',
                disabled: true,
                onClick: expect.any(Function),
                title: 'Redo',
                type: 'button',
            });
            expect(wrapper.exists(IconRedo)).toBe(true);

            // Delete button
            expect(getButton(wrapper, 'delete').props()).toMatchObject({
                className: 'ba-PopupDrawingToolbar-delete',
                'data-testid': 'ba-PopupDrawingToolbar-delete',
                onClick: expect.any(Function),
                title: 'Delete',
                type: 'button',
            });
            expect(wrapper.exists(IconTrash)).toBe(true);

            // Add comment button
            expect(getButton(wrapper, 'comment').props()).toMatchObject({
                className: 'ba-PopupDrawingToolbar-comment',
                'data-testid': 'ba-PopupDrawingToolbar-comment',
                disabled: false,
                onClick: expect.any(Function),
                type: 'button',
            });
            expect(wrapper.find(FormattedMessage).props()).toMatchObject(messages.drawingButtonAddComment);
        });

        test.each`
            canProp         | buttonId
            ${'canComment'} | ${'comment'}
            ${'canRedo'}    | ${'redo'}
            ${'canUndo'}    | ${'undo'}
        `('should disable button with id $buttonId if $canProp is false', ({ canProp, buttonId }) => {
            const wrapper = getWrapper({ [canProp]: false });

            expect(getButton(wrapper, buttonId).prop('disabled')).toBe(true);
        });
    });

    describe('callbacks', () => {
        test.each`
            callback      | buttonId
            ${'onUndo'}   | ${'undo'}
            ${'onRedo'}   | ${'redo'}
            ${'onDelete'} | ${'delete'}
            ${'onReply'}  | ${'comment'}
        `('should call $callback when $button is clicked', ({ callback, buttonId }) => {
            const mockFn = jest.fn();
            const wrapper = getWrapper({ [callback]: mockFn, canRedo: true, canUndo: true });

            getButton(wrapper, buttonId).simulate('click');

            expect(mockFn).toHaveBeenCalled();
        });
    });
});
