import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import HighlightAnnotations from '../HighlightAnnotations';
import HighlightCreator from '../HighlightCreator';
import PopupReply from '../../components/Popups/PopupReply';
import { HighlightList } from '../HighlightList';
import { CreatorStatus, CreatorHighlight } from '../../store';
import { Rect } from '../../@types';

jest.mock('../HighlightCreator');

describe('components/highlight/HighlightAnnotations', () => {
    const defaults = {
        activeAnnotationId: null,
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
    const getHighlightRef = (): HTMLDivElement => document.createElement('div');
    const getStaged = (): CreatorHighlight => ({
        location: 1,
        shapes: [getRect()],
        type: 'highlight',
    });
    const getWrapper = (props = {}): ShallowWrapper<{}, {}, HighlightAnnotations> =>
        shallow(<HighlightAnnotations {...defaults} {...props} />);

    describe('render()', () => {
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
            // expect(wrapper.exists(SingleHighlightAnnotation)).toBe(false);
            expect(wrapper.exists(PopupReply)).toBe(false);
        });

        test('should render a SingleHighlightAnnotation if staged object exists', () => {
            // const wrapper = getWrapper({
            //     isCreating: true,
            //     staged: getStaged(),
            // });
            // expect(wrapper.exists(SingleHighlightAnnotation)).toBe(true);
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

            wrapper.setState({
                highlightRef: getHighlightRef(),
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
            wrapper.setState({
                highlightRef: getHighlightRef(),
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
            const instance = wrapper.instance();

            instance.handleAnnotationActive('123');

            expect(defaults.setActiveAnnotationId).toHaveBeenCalledWith('123');
        });
    });

    describe('event handlers', () => {
        let wrapper: ShallowWrapper<{}, {}, HighlightAnnotations>;
        let instance: InstanceType<typeof HighlightAnnotations>;

        beforeEach(() => {
            wrapper = getWrapper({ staged: getStaged() });
            instance = wrapper.instance();
        });

        test('handleCancel()', () => {
            instance.handleCancel();

            expect(defaults.setMessage).toHaveBeenCalledWith('');
            expect(defaults.setStaged).toHaveBeenCalledWith(null);
            expect(defaults.setStatus).toHaveBeenCalledWith(CreatorStatus.init);
        });

        describe('handleChange', () => {
            test('should set the staged state with the new message', () => {
                instance.handleChange('test');

                expect(defaults.setMessage).toHaveBeenCalledWith('test');
            });

            test('should set the staged state with empty string', () => {
                instance.handleChange();

                expect(defaults.setMessage).toHaveBeenCalledWith('');
            });
        });

        describe('handleSubmit', () => {
            test('should save the staged annotation', () => {
                instance.handleSubmit();

                expect(defaults.createHighlight).toHaveBeenCalledWith({
                    ...getStaged(),
                    message: defaults.message,
                });
            });

            test('should not save if staged is falsy', () => {
                wrapper = getWrapper();
                instance = wrapper.instance();

                instance.handleSubmit();

                expect(defaults.createHighlight).not.toHaveBeenCalled();
            });
        });
    });
});
