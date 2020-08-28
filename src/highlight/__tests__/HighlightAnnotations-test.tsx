import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import HighlightAnnotations from '../HighlightAnnotations';
import HighlightCanvas from '../HighlightCanvas';
import HighlightCreator from '../HighlightCreator';
import HighlightSvg from '../HighlightSvg';
import PopupHighlight from '../../components/Popups/PopupHighlight';
import PopupReply from '../../components/Popups/PopupReply';
import { CreatorStatus, CreatorItemHighlight } from '../../store';
import { HighlightList } from '../HighlightList';
import { Rect } from '../../@types';
import { selection as selectionMock } from '../__mocks__/data';

jest.mock('../../components/Popups/PopupHighlight');
jest.mock('../HighlightCreator');

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useState: jest.fn(),
}));

describe('HighlightAnnotations', () => {
    const defaults = {
        activeAnnotationId: null,
        annotations: [],
        createHighlight: jest.fn(),
        isCreating: false,
        isPromoting: false,
        location: 1,
        message: 'test',
        resetCreator: jest.fn(),
        selection: null,
        setActiveAnnotationId: jest.fn(),
        setIsPromoting: jest.fn(),
        setMessage: jest.fn(),
        setMode: jest.fn(),
        setSelection: jest.fn(),
        setStaged: jest.fn(),
        setStatus: jest.fn(),
        staged: null,
        status: CreatorStatus.init,
    };

    const getRect = (): Rect => ({
        type: 'rect',
        height: 50,
        width: 50,
        x: 10,
        y: 10,
    });
    const getStaged = (): CreatorItemHighlight => ({
        location: 1,
        shapes: [getRect()],
    });
    const getWrapper = (props = {}): ShallowWrapper => shallow(<HighlightAnnotations {...defaults} {...props} />);

    describe('render()', () => {
        const mockSetHighlightRef = jest.fn();

        beforeEach(() => {
            jest.spyOn(React, 'useState').mockImplementation(() => [true, mockSetHighlightRef]);
        });

        test('should render a RegionCreator if in creation mode', () => {
            const wrapper = getWrapper({ isCreating: true });
            const creator = wrapper.find(HighlightCreator);

            expect(wrapper.find(HighlightList).exists()).toBe(true);
            expect(creator.hasClass('ba-HighlightAnnotations-creator')).toBe(true);
        });

        test('should not render creation components if not in creation mode', () => {
            const wrapper = getWrapper({ isCreating: false });

            expect(wrapper.find(HighlightList).exists()).toBe(true);
            expect(wrapper.exists(HighlightCreator)).toBe(false);
            expect(wrapper.exists(HighlightCanvas)).toBe(false);
            expect(wrapper.exists(HighlightSvg)).toBe(false);
            expect(wrapper.exists(PopupReply)).toBe(false);
        });

        test('should render a staged highlight if staged object exists', () => {
            const wrapper = getWrapper({
                isCreating: true,
                staged: getStaged(),
            });
            expect(wrapper.exists('.ba-HighlightAnnotations-target')).toBe(true);
        });

        test.each`
            status                    | showReply
            ${CreatorStatus.init}     | ${false}
            ${CreatorStatus.pending}  | ${true}
            ${CreatorStatus.rejected} | ${true}
            ${CreatorStatus.staged}   | ${true}
        `('should render a reply popup if the creator status is $status', ({ status, showReply }) => {
            const wrapper = getWrapper({
                isCreating: true,
                staged: getStaged(),
                status,
            });

            expect(wrapper.exists(PopupReply)).toBe(showReply);
        });

        test.each`
            status                    | isPending
            ${CreatorStatus.rejected} | ${false}
            ${CreatorStatus.pending}  | ${true}
            ${CreatorStatus.staged}   | ${false}
        `('should render reply popup with isPending $isPending', ({ status, isPending }) => {
            const wrapper = getWrapper({
                isCreating: true,
                staged: getStaged(),
                status,
            });

            expect(wrapper.find(PopupReply).prop('isPending')).toBe(isPending);
        });

        test.each`
            isCreating | selection        | showPopup
            ${true}    | ${null}          | ${false}
            ${true}    | ${selectionMock} | ${false}
            ${false}   | ${null}          | ${false}
            ${false}   | ${selectionMock} | ${true}
        `('should render popup promoter with isCreating $isCreating', ({ isCreating, selection, showPopup }) => {
            const wrapper = getWrapper({
                isCreating,
                selection,
            });

            expect(wrapper.exists(PopupHighlight)).toBe(showPopup);
        });

        test('should pass activeId to the region list', () => {
            const wrapper = getWrapper({ activeAnnotationId: '123' });

            expect(wrapper.find(HighlightList).prop('activeId')).toBe('123');
        });
    });

    describe('handleAnnotationActive()', () => {
        test('should call setActiveAnnotationId', () => {
            const wrapper = getWrapper();
            wrapper.find(HighlightList).simulate('select', '123');

            expect(defaults.setActiveAnnotationId).toHaveBeenCalledWith('123');
        });
    });

    describe('handlePromote()', () => {
        test('should clear selection and set isPromoting', () => {
            const wrapper = getWrapper({ selection: selectionMock });
            wrapper.find(PopupHighlight).simulate('click');

            expect(defaults.setIsPromoting).toHaveBeenCalledWith(true);
            expect(defaults.setSelection).toHaveBeenCalledWith(null);
        });
    });

    describe('event handlers', () => {
        const mockSetHighlightRef = jest.fn();
        let wrapper: ShallowWrapper;

        beforeEach(() => {
            jest.spyOn(React, 'useState').mockImplementation(() => [true, mockSetHighlightRef]);
            wrapper = getWrapper({
                isCreating: true,
                isPromoting: true,
                staged: getStaged(),
                status: CreatorStatus.staged,
            });
        });

        describe('handleCancel()', () => {
            test('should reset creator and reset isPromoting', () => {
                wrapper.find(PopupReply).simulate('cancel');

                expect(defaults.resetCreator).toHaveBeenCalled();
                expect(defaults.setIsPromoting).toHaveBeenCalledWith(false);
            });
        });

        describe('handleChange', () => {
            test('should set the staged state with the new message', () => {
                wrapper.find(PopupReply).simulate('change', 'foo');

                expect(defaults.setMessage).toHaveBeenCalledWith('foo');
            });

            test('should set the staged state with empty string', () => {
                wrapper.find(PopupReply).simulate('change');

                expect(defaults.setMessage).toHaveBeenCalledWith('');
            });
        });

        describe('handleSubmit', () => {
            test('should save the staged annotation and reset isPromoting', () => {
                wrapper.find(PopupReply).simulate('submit');

                expect(defaults.createHighlight).toHaveBeenCalledWith({
                    ...getStaged(),
                    message: defaults.message,
                });
                expect(defaults.setIsPromoting).toHaveBeenCalledWith(false);
            });
        });
    });
});
