import React from 'react';
import { EditorState } from 'draft-js';
import { shallow, ShallowWrapper } from 'enzyme';
import { IntlShape } from 'react-intl';
import PopupReply from '../../components/Popups/PopupReply';
import RegionAnnotation from '../RegionAnnotation';
import RegionAnnotations from '../RegionAnnotations';
import RegionCreator from '../RegionCreator';
import RegionList from '../RegionList';
import { annotations } from '../__mocks__/data';
import { CreatorItem, CreatorStatus } from '../../store';
import { Rect } from '../../@types';
import { scaleShape } from '../regionUtil';

jest.mock('../../components/Popups/PopupReply');
jest.mock('../RegionAnnotation');
jest.mock('../RegionCreator');
jest.mock('../RegionList');
jest.mock('../regionUtil', () => ({
    scaleShape: jest.fn(value => value),
}));

describe('RegionAnnotations', () => {
    const defaults = {
        activeAnnotationId: null,
        createRegion: jest.fn(),
        intl: ({ formatMessage: jest.fn() } as unknown) as IntlShape,
        page: 1,
        scale: 1,
        setActiveAnnotationId: jest.fn(),
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
    const getStaged = (): CreatorItem => ({
        location: 1,
        message: 'test',
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

                expect(defaults.setStaged).toHaveBeenCalledWith(null);
                expect(defaults.setStatus).toHaveBeenCalledWith(CreatorStatus.init);
            });
        });

        describe('handleChange', () => {
            test('should set the staged state with the new message', () => {
                instance.handleChange(({
                    getCurrentContent: jest.fn().mockReturnValue({
                        getPlainText: jest.fn().mockReturnValue('test'),
                    }),
                } as unknown) as EditorState);

                expect(defaults.setStaged).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: 'test',
                    }),
                );
            });
        });

        describe('handleDraw', () => {
            test('should update the staged annotation with the new scaled shape', () => {
                const shape = {
                    type: 'rect' as const,
                    height: 100,
                    width: 100,
                    x: 20,
                    y: 20,
                };

                instance.handleDraw(shape);

                expect(scaleShape).toHaveBeenCalledWith(shape, defaults.scale, true); // Inverse scale
                expect(defaults.setStaged).toHaveBeenCalledWith(expect.objectContaining({ shape }));
            });

            test('should not update the staged annotation if the shape has not changed', () => {
                instance.handleDraw(getRect());

                expect(defaults.setStaged).not.toHaveBeenCalled();
            });
        });
        describe('handleStart', () => {
            test('should reset the creator status', () => {
                instance.handleStart();

                expect(defaults.setStatus).toHaveBeenCalledWith(CreatorStatus.init);
            });
        });

        describe('handleStop', () => {
            test('should set the creator status to staged', () => {
                instance.handleStop();

                expect(defaults.setStatus).toHaveBeenCalledWith(CreatorStatus.staged);
            });
        });

        describe('handleSubmit', () => {
            test('should save the staged annotation', () => {
                instance.handleSubmit();

                expect(defaults.createRegion).toHaveBeenCalledWith(getStaged());
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
            expect(list.prop('annotations').length).toBe(3);
        });

        test('should render a RegionCreator if in creation mode', () => {
            const wrapper = getWrapper({ isCreating: true });
            const creator = wrapper.find(RegionCreator);

            expect(creator.hasClass('ba-RegionAnnotations-creator')).toBe(true);
            expect(creator.prop('canDraw')).toBe(true);
        });

        test('should scale and render a RegionAnnotation if one has been drawn', () => {
            const shape = getRect();
            const wrapper = getWrapper({
                isCreating: true,
                scale: 1.5,
                staged: {
                    location: 1,
                    message: null,
                    shape,
                },
            });

            expect(scaleShape).toHaveBeenCalledWith(shape, 1.5);
            expect(wrapper.exists(RegionCreator)).toBe(true);
            expect(wrapper.find(RegionAnnotation).prop('shape')).toBe(shape);
        });

        test('should render a reply popup only if a shape has been fully drawn', () => {
            const wrapper = getWrapper({
                isCreating: true,
                staged: getStaged(),
                status: CreatorStatus.staged,
            });
            wrapper.setState({
                targetRef: document.createElement('a'),
            });

            const editorState = wrapper.find(PopupReply).prop('editorState');
            const defaultValue = editorState.getCurrentContent().getPlainText();

            expect(defaultValue).toEqual('test');
        });

        test.each`
            status                   | isPending
            ${CreatorStatus.pending} | ${true}
            ${CreatorStatus.staged}  | ${false}
        `('should render reply popup with isPending $isPending', ({ status, isPending }) => {
            const wrapper = getWrapper({
                isCreating: true,
                staged: getStaged(),
                status,
            });
            wrapper.setState({
                targetRef: document.createElement('a'),
            });

            expect(wrapper.find(PopupReply).prop('isPending')).toBe(isPending);
        });

        test.each([true, false])('should pass activeId to list only if isCreating is %s', isCreating => {
            const wrapper = getWrapper({
                activeAnnotationId: '123',
                isCreating,
            });

            expect(wrapper.find(RegionList).prop('activeId')).toBe(isCreating ? null : '123');
        });

        test('should not render creation components if not in creation mode', () => {
            const wrapper = getWrapper({
                annotations: [],
                isCreating: false,
            });

            expect(wrapper.exists(PopupReply)).toBe(false);
            expect(wrapper.exists(RegionAnnotation)).toBe(false);
            expect(wrapper.exists(RegionCreator)).toBe(false);
            expect(wrapper.exists(RegionList)).toBe(true);
        });
    });
});
