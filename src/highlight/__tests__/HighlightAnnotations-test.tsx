import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import HighlightAnnotations from '../HighlightAnnotations';
import HighlightCreator from '../HighlightCreator';
import PopupReply from '../../components/Popups/PopupReply';
import { HighlightList } from '../HighlightList';
import { CreatorStatus, CreatorHighlight } from '../../store';
import { Rect } from '../../@types';

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
        location: 1,
        message: 'test',
        setActiveAnnotationId: jest.fn(),
        setMessage: jest.fn(),
        setMode: jest.fn(),
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
    const getStaged = (): CreatorHighlight => ({
        target: {
            location: { value: 1, type: 'page' },
            shapes: [getRect()],
            type: 'highlight',
        },
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
            expect(wrapper.exists('.ba-HighlightAnnotations-target')).toBe(false);
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

    describe('event handlers', () => {
        const mockSetHighlightRef = jest.fn();
        let wrapper: ShallowWrapper;

        beforeEach(() => {
            jest.spyOn(React, 'useState').mockImplementation(() => [true, mockSetHighlightRef]);
            wrapper = getWrapper({ isCreating: true, staged: getStaged(), status: CreatorStatus.staged });
        });

        test('handleCancel()', () => {
            wrapper.find(PopupReply).simulate('cancel');

            expect(defaults.setMessage).toHaveBeenCalledWith('');
            expect(defaults.setStaged).toHaveBeenCalledWith(null);
            expect(defaults.setStatus).toHaveBeenCalledWith(CreatorStatus.init);
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
            test('should save the staged annotation', () => {
                wrapper.find(PopupReply).simulate('submit');

                expect(defaults.createHighlight).toHaveBeenCalledWith({
                    ...getStaged(),
                    message: defaults.message,
                });
            });
        });
    });
});
