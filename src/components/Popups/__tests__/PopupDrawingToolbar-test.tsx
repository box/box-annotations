import React from 'react';
import * as ReactRedux from 'react-redux';
import IconRedo from 'box-ui-elements/es/icon/line/Redo16';
import IconTrash from 'box-ui-elements/es/icon/line/Trash16';
import IconUndo from 'box-ui-elements/es/icon/line/Undo16';
import { FormattedMessage } from 'react-intl';
import { shallow, ShallowWrapper } from 'enzyme';
import ArrowBack from '../../../icons/ArrowBack';
import ArrowForward from '../../../icons/ArrowForward';
import Trash from '../../../icons/Trash';
import messages from '../messages';
import PopupBase from '../PopupBase';
import PopupDrawingToolbar, { Props } from '../PopupDrawingToolbar';

jest.mock('react-redux', () => ({
    __esModule: true,
    ...jest.requireActual('react-redux'),
    useSelector: jest.fn(),
}));

describe('PopupDrawingToolbar', () => {
    const getDataTestId = (button: string): string => `ba-PopupDrawingToolbar-${button}`;
    const getButton = (wrapper: ShallowWrapper, button: string): ShallowWrapper =>
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
        onDelete: jest.fn(),
        onRedo: jest.fn(),
        onReply: jest.fn(),
        onUndo: jest.fn(),
        reference: { getBoundingClientRect: () => getDOMRect() },
    });
    const getWrapper = (props?: Partial<Props>): ShallowWrapper =>
        shallow(<PopupDrawingToolbar {...getDefaults()} {...props} />);

    beforeEach(() => {
        jest.spyOn(ReactRedux, 'useSelector').mockImplementation(() => false);
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
            const wrapper = getWrapper({ [callback]: mockFn });

            getButton(wrapper, buttonId).simulate('click');

            expect(mockFn).toHaveBeenCalled();
        });
    });

    describe('modernization feature flag', () => {
        test('should render legacy icons when modernization is disabled', () => {
            jest.spyOn(ReactRedux, 'useSelector').mockImplementation(() => false);
            const wrapper = getWrapper();

            expect(wrapper.exists(IconUndo)).toBe(true);
            expect(wrapper.exists(IconRedo)).toBe(true);
            expect(wrapper.exists(IconTrash)).toBe(true);
            expect(wrapper.exists(ArrowBack)).toBe(false);
            expect(wrapper.exists(ArrowForward)).toBe(false);
            expect(wrapper.exists(Trash)).toBe(false);
        });

        test('should render modernized icons when modernization is enabled', () => {
            jest.spyOn(ReactRedux, 'useSelector').mockImplementation(() => true);
            const wrapper = getWrapper();

            expect(wrapper.exists(ArrowBack)).toBe(true);
            expect(wrapper.exists(ArrowForward)).toBe(true);
            expect(wrapper.exists(Trash)).toBe(true);
            expect(wrapper.exists(IconUndo)).toBe(false);
            expect(wrapper.exists(IconRedo)).toBe(false);
            expect(wrapper.exists(IconTrash)).toBe(false);
        });

        test('should not apply modernized class when modernization is disabled', () => {
            jest.spyOn(ReactRedux, 'useSelector').mockImplementation(() => false);
            const wrapper = getWrapper({ className: 'foo' });

            expect(wrapper.find(PopupBase).props()).toMatchObject({
                className: 'foo ba-PopupDrawingToolbar',
            });
        });

        test('should apply modernized class when modernization is enabled', () => {
            jest.spyOn(ReactRedux, 'useSelector').mockImplementation(() => true);
            const wrapper = getWrapper({ className: 'foo' });

            expect(wrapper.find(PopupBase).props()).toMatchObject({
                className: 'foo ba-PopupDrawingToolbar ba-PopupDrawingToolbar--modernized',
            });
        });
    });
});
