import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import PopupReply from '../../components/Popups/PopupReply';
import RegionAnnotations from '../RegionAnnotations';
import RegionCreator from '../RegionCreator';
import RegionList from '../RegionList';
import RegionRect from '../RegionRect';
import { annotations } from '../__mocks__/data';
import { CreatorItem, CreatorStatus } from '../../store';
import { Rect } from '../../@types';

jest.mock('../../components/Popups/PopupReply');
jest.mock('../RegionCreator');
jest.mock('../RegionList');
jest.mock('../RegionRect');

describe('RegionAnnotations', () => {
    const defaults = {
        activeAnnotationId: null,
        createRegion: jest.fn(),
        location: 1,
        message: 'test',
        setActiveAnnotationId: jest.fn(),
        setMessage: jest.fn(),
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
    const getRectRef = (): HTMLDivElement => document.createElement('div');
    const getStaged = (): CreatorItem => ({
        location: 1,
        shape: getRect(),
    });
    const getWrapper = (props = {}): ShallowWrapper => shallow(<RegionAnnotations {...defaults} {...props} />);

    describe('event handlers', () => {
        let wrapper: ShallowWrapper;
        let instance: InstanceType<typeof RegionAnnotations>;

        beforeEach(() => {
            wrapper = getWrapper({
                staged: getStaged(),
            });
            instance = wrapper.instance() as InstanceType<typeof RegionAnnotations>;
        });

        describe('handleCancel', () => {
            test('should reset the staged state and status', () => {
                instance.handleCancel();

                expect(defaults.setMessage).toHaveBeenCalledWith('');
                expect(defaults.setStaged).toHaveBeenCalledWith(null);
                expect(defaults.setStatus).toHaveBeenCalledWith(CreatorStatus.init);
            });
        });

        describe('handleChange', () => {
            test('should set the staged state with the new message', () => {
                instance.handleChange('test');

                expect(defaults.setMessage).toHaveBeenCalledWith('test');
            });
        });

        describe('handleStart', () => {
            test('should reset the creator status', () => {
                instance.handleStart();

                expect(defaults.setStaged).toHaveBeenCalledWith(null);
                expect(defaults.setStatus).toHaveBeenCalledWith(CreatorStatus.started);
            });
        });

        describe('handleStop', () => {
            const shape = {
                type: 'rect' as const,
                height: 10,
                width: 10,
                x: 20,
                y: 20,
            };

            test('should update the staged status and item with the new shape', () => {
                instance.handleStop(shape);

                expect(defaults.setStaged).toHaveBeenCalledWith({
                    location: defaults.location,
                    shape,
                });
                expect(defaults.setStatus).toHaveBeenCalledWith(CreatorStatus.staged);
            });
        });

        describe('handleSubmit', () => {
            test('should save the staged annotation', () => {
                instance.handleSubmit();

                expect(defaults.createRegion).toHaveBeenCalledWith({
                    ...getStaged(),
                    message: defaults.message,
                });
            });
        });

        describe('handleAnnotationActive()', () => {
            test('should call setActiveAnnotationId with annotation id', () => {
                instance.handleAnnotationActive('123');

                expect(defaults.setActiveAnnotationId).toHaveBeenCalledWith('123');
            });
        });
    });

    describe('render()', () => {
        test('should render one RegionAnnotation per annotation', () => {
            const wrapper = getWrapper({ annotations });
            const list = wrapper.find(RegionList);

            expect(list.hasClass('ba-RegionAnnotations-list')).toBe(true);
            expect(list.prop('annotations').length).toBe(annotations.length);
        });

        test('should render a RegionCreator if in creation mode', () => {
            const wrapper = getWrapper({ isCreating: true });
            const creator = wrapper.find(RegionCreator);

            expect(creator.hasClass('ba-RegionAnnotations-creator')).toBe(true);
        });

        test('should render a RegionAnnotation if one has been drawn', () => {
            const shape = getRect();
            const wrapper = getWrapper({
                isCreating: true,
                staged: {
                    location: 1,
                    message: null,
                    shape,
                },
            });

            expect(wrapper.exists(RegionCreator)).toBe(true);
            expect(wrapper.find(RegionRect).prop('shape')).toEqual(shape);
        });

        test('should pass the creator item message value to the reply popup', () => {
            const wrapper = getWrapper({
                isCreating: true,
                staged: getStaged(),
                status: CreatorStatus.staged,
            });
            wrapper.setState({
                rectRef: getRectRef(),
            });

            expect(wrapper.find(PopupReply).props()).toMatchObject({
                value: 'test',
            });
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
                rectRef: getRectRef(),
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
                rectRef: getRectRef(),
            });

            expect(wrapper.find(PopupReply).prop('isPending')).toBe(isPending);
        });

        test('should pass activeId to the region list', () => {
            const wrapper = getWrapper({ activeAnnotationId: '123' });

            expect(wrapper.find(RegionList).prop('activeId')).toBe('123');
        });

        test('should not render creation components if not in creation mode', () => {
            const wrapper = getWrapper({
                annotations: [],
                isCreating: false,
            });

            expect(wrapper.exists(PopupReply)).toBe(false);
            expect(wrapper.exists(RegionCreator)).toBe(false);
            expect(wrapper.exists(RegionList)).toBe(true);
            expect(wrapper.exists(RegionRect)).toBe(false);
        });

        test('should not render creation components if file is rotated', () => {
            const wrapper = getWrapper({
                annotations: [],
                isRotated: false,
            });

            expect(wrapper.exists(PopupReply)).toBe(false);
            expect(wrapper.exists(RegionCreator)).toBe(false);
            expect(wrapper.exists(RegionList)).toBe(true);
            expect(wrapper.exists(RegionRect)).toBe(false);
        });
    });
});
