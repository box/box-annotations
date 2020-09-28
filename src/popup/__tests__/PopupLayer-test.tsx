import React from 'react';
import { ReactWrapper, mount } from 'enzyme';
import PopupLayer from '../PopupLayer';
import PopupReply from '../../components/Popups/PopupReply';
import { CreatorStatus, CreatorItemHighlight, CreatorItemRegion, Mode } from '../../store';
import { Rect } from '../../@types';

jest.mock('../../components/Popups/PopupReply');

describe('PopupLayer', () => {
    const popupReference = { height: 10, width: 10, x: 10, y: 10 };
    const getRect = (): Rect => ({
        type: 'rect',
        height: 50,
        width: 50,
        x: 10,
        y: 10,
    });
    const getStagedHighlight = (): CreatorItemHighlight => ({
        location: 1,
        shapes: [getRect()],
    });
    const getStagedRegion = (): CreatorItemRegion => ({
        location: 1,
        shape: getRect(),
    });
    const defaults = {
        createHighlight: jest.fn(),
        createRegion: jest.fn(),
        isPromoting: false,
        location: 1,
        message: '',
        mode: Mode.HIGHLIGHT,
        popupReference,
        resetCreator: jest.fn(),
        setMessage: jest.fn(),
        staged: getStagedHighlight(),
        status: CreatorStatus.staged,
    };
    const getWrapper = (props = {}): ReactWrapper => mount(<PopupLayer {...defaults} {...props} />);

    const mockSetReference = jest.fn();
    const mockReference = {
        getBoundingClientRect: () => ({
            height: 10,
            width: 10,
            top: 10,
            left: 10,
        }),
    };

    beforeEach(() => {
        jest.spyOn(React, 'useState').mockImplementation(() => [mockReference, mockSetReference]);
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

        test('should render PopupReply if promoting a highlight', () => {
            const wrapper = getWrapper({ mode: Mode.NONE, isPromoting: true });
            expect(wrapper.exists(PopupReply)).toBe(true);
        });
    });

    describe('event handlers', () => {
        describe('handleCancel()', () => {
            test('should reset creator and reset isPromoting', () => {
                const wrapper = getWrapper();
                wrapper.find(PopupReply).prop('onCancel')();

                expect(defaults.resetCreator).toHaveBeenCalled();
            });
        });

        describe('handleChange', () => {
            test('should set the staged state with the new message', () => {
                const wrapper = getWrapper();
                wrapper.find(PopupReply).prop('onChange')('foo');

                expect(defaults.setMessage).toHaveBeenCalledWith('foo');
            });

            test('should set the staged state with empty string', () => {
                const wrapper = getWrapper();
                wrapper.find(PopupReply).prop('onChange')();

                expect(defaults.setMessage).toHaveBeenCalledWith('');
            });
        });

        describe('handleSubmit', () => {
            test('should create highlight if staged item is type highlight', () => {
                const wrapper = getWrapper();
                wrapper.find(PopupReply).prop('onSubmit')('');

                expect(defaults.createHighlight).toHaveBeenCalledWith({
                    ...getStagedHighlight(),
                    message: defaults.message,
                });
                expect(defaults.createRegion).not.toHaveBeenCalled();
            });

            test('should create region if staged item is type region', () => {
                const wrapper = getWrapper({ mode: Mode.REGION, staged: getStagedRegion() });
                wrapper.find(PopupReply).prop('onSubmit')('');

                expect(defaults.createHighlight).not.toHaveBeenCalled();
                expect(defaults.createRegion).toHaveBeenCalledWith({
                    ...getStagedRegion(),
                    message: defaults.message,
                });
            });
        });
    });
});
