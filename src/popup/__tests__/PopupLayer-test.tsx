import React from 'react';
import { ReactWrapper, mount } from 'enzyme';
import PopupLayer, { Props } from '../PopupLayer';
import PopupReply from '../../components/Popups/PopupReply';
import { pathGroups } from '../../drawing/__mocks__/drawingData';
import { CreatorStatus, CreatorItemHighlight, CreatorItemRegion, Mode, CreatorItemDrawing } from '../../store';
import { Rect } from '../../@types';
import { PAGE } from '../../constants';

jest.mock('../../components/Popups/PopupReply');

describe('PopupLayer', () => {
    const getRect = (): Rect => ({
        type: 'rect',
        height: 50,
        width: 50,
        x: 10,
        y: 10,
    });
    const getStagedDrawing = (): CreatorItemDrawing => ({
        location: 1,
        pathGroups,
    });
    const getStagedHighlight = (): CreatorItemHighlight => ({
        location: 1,
        shapes: [getRect()],
    });
    const getStagedRegion = (): CreatorItemRegion => ({
        location: 1,
        shape: getRect(),
    });

    const referenceId = '123';
    const getDefaults = (): Props => ({
        createDrawing: jest.fn(),
        createHighlight: jest.fn(),
        createRegion: jest.fn(),
        isPromoting: false,
        location: 1,
        message: '',
        mode: Mode.HIGHLIGHT,
        referenceId: '123',
        resetCreator: jest.fn(),
        setMessage: jest.fn(),
        staged: getStagedHighlight(),
        status: CreatorStatus.staged,
        targetType: PAGE,
    });
    const getWrapper = (props = {}): ReactWrapper => mount(<PopupLayer {...getDefaults()} {...props} />);
    

    beforeEach(() => {
        document.body.innerHTML = `<div data-ba-reference-id="${referenceId}"></div>`;
    });

    describe('render()', () => {
        test.each`
            status                    | showReply
            ${CreatorStatus.init}     | ${false}
            ${CreatorStatus.pending}  | ${true}
            ${CreatorStatus.rejected} | ${true}
            ${CreatorStatus.staged}   | ${true}
        `('should render a reply popup ($showReply) if the creator status is $status', ({ status, showReply }) => {
            const wrapper = getWrapper({ status });

            expect(wrapper.exists(PopupReply)).toBe(showReply);
        });

        test.each`
            status                    | isPending
            ${CreatorStatus.rejected} | ${false}
            ${CreatorStatus.pending}  | ${true}
            ${CreatorStatus.staged}   | ${false}
        `('should render reply popup with isPending $isPending', ({ status, isPending }) => {
            const wrapper = getWrapper({ status });

            expect(wrapper.find(PopupReply).prop('isPending')).toBe(isPending);
        });

        test('should not render PopupReply if there is a staged type and mode mismatch', () => {
            // defaults has staged as highlight
            const wrapper = getWrapper({ mode: Mode.REGION });

            expect(wrapper.exists(PopupReply)).toBe(false);
        });

        test('should render PopupReply if promoting a highlight and staged exists', () => {
            const wrapper = getWrapper({ mode: Mode.NONE, isPromoting: true });
            expect(wrapper.exists(PopupReply)).toBe(true);
        });

        test('should not render PopupReply if promoting a highlight but staged does not exist', () => {
            const wrapper = getWrapper({ mode: Mode.NONE, isPromoting: true, staged: null });
            expect(wrapper.exists(PopupReply)).toBe(false);
        });

        test('should render PopupReply if it is a staged drawing', () => {
            const wrapper = getWrapper({ mode: Mode.DRAWING, staged: getStagedDrawing() });
            expect(wrapper.exists(PopupReply)).toBe(true);
        });
    });

    describe('event handlers', () => {
        describe('handleCancel()', () => {
            test('should reset creator and reset isPromoting', () => {
                const resetCreator = jest.fn();
                const wrapper = getWrapper({ resetCreator });
                wrapper.find(PopupReply).prop('onCancel')();

                expect(resetCreator).toHaveBeenCalled();
            });
        });

        describe('handleChange', () => {
            test('should set the staged state with the new message', () => {
                const setMessage = jest.fn();
                const wrapper = getWrapper({ setMessage });
                wrapper.find(PopupReply).prop('onChange')('foo');

                expect(setMessage).toHaveBeenCalledWith('foo');
            });

            test('should set the staged state with empty string', () => {
                const setMessage = jest.fn();
                const wrapper = getWrapper({ setMessage });
                wrapper.find(PopupReply).prop('onChange')();

                expect(setMessage).toHaveBeenCalledWith('');
            });
        });

        describe('handleSubmit', () => {
            test('should create highlight if staged item is type highlight', () => {
                const createDrawing = jest.fn();
                const createHighlight = jest.fn();
                const createRegion = jest.fn();
                const message = 'foo';
                const wrapper = getWrapper({ createHighlight, createRegion, message });
                wrapper.find(PopupReply).prop('onSubmit')('');

                expect(createDrawing).not.toHaveBeenCalled();
                expect(createHighlight).toHaveBeenCalledWith({
                    ...getStagedHighlight(),
                    message,
                    targetType: 'page',
                });
                expect(createRegion).not.toHaveBeenCalled();
            });

            test('should create region if staged item is type region', () => {
                const createDrawing = jest.fn();
                const createHighlight = jest.fn();
                const createRegion = jest.fn();
                const message = 'foo';
                const wrapper = getWrapper({
                    createHighlight,
                    createRegion,
                    message,
                    mode: Mode.REGION,
                    staged: getStagedRegion(),
                });
                wrapper.find(PopupReply).prop('onSubmit')('');

                expect(createDrawing).not.toHaveBeenCalled();
                expect(createHighlight).not.toHaveBeenCalled();
                expect(createRegion).toHaveBeenCalledWith({
                    ...getStagedRegion(),
                    message,
                    targetType: 'page',
                });
            });

            test('should create drawing if staged item is type drawing', () => {
                const createDrawing = jest.fn();
                const createHighlight = jest.fn();
                const createRegion = jest.fn();
                const message = 'foo';
                const wrapper = getWrapper({
                    createDrawing,
                    createHighlight,
                    createRegion,
                    message,
                    mode: Mode.DRAWING,
                    staged: getStagedDrawing(),
                    targetType: 'frame',
                });
                wrapper.find(PopupReply).prop('onSubmit')('');

                expect(createDrawing).toHaveBeenCalledWith({
                    ...getStagedDrawing(),
                    message,
                    targetType: 'frame',
                });
                expect(createHighlight).not.toHaveBeenCalled();
                expect(createRegion).not.toHaveBeenCalled();
            });
        });
    });
});
