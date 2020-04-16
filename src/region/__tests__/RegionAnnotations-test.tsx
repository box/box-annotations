import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import PopupReply from '../../components/Popups/PopupReply';
import RegionAnnotation from '../RegionAnnotation';
import RegionAnnotations from '../RegionAnnotations';
import RegionCreator from '../RegionCreator';
import { annotations } from '../__mocks__/data';
import { CreatorItem, CreatorStatus } from '../../store';
import { Rect } from '../../@types';

jest.mock('../../components/Popups/PopupReply');
jest.mock('../RegionAnnotation');
jest.mock('../RegionCreator');

describe('RegionAnnotations', () => {
    const defaults = {
        activeAnnotationId: null,
        createRegion: jest.fn(),
        page: 1,
        scale: 1,
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
    const getWrapper = (props = {}): ShallowWrapper => shallow(<RegionAnnotations {...defaults} {...props} />);

    describe('scaleShape()', () => {
        test('should format the underlying shape based on scale', () => {
            const wrapper = getWrapper({ scale: 2 });
            const instance = wrapper.instance() as InstanceType<typeof RegionAnnotations>;
            const shape = instance.scaleShape(getRect());

            expect(shape).toMatchObject({
                type: 'rect',
                height: 100,
                width: 100,
                x: 20,
                y: 20,
            });
        });
    });

    describe('event handlers', () => {
        const wrapper = getWrapper({ staged: {} as CreatorItem });
        const instance = wrapper.instance() as InstanceType<typeof RegionAnnotations>;

        describe('handleCancel', () => {
            test('should reset the staged state and status', () => {
                instance.handleCancel();

                expect(defaults.setStaged).toHaveBeenCalledWith(null);
                expect(defaults.setStatus).toHaveBeenCalledWith(CreatorStatus.init);
            });
        });

        describe('handleChange', () => {
            test('should set the staged state with the new message', () => {
                instance.handleChange('test');

                expect(defaults.setStaged).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: 'test',
                    }),
                );
            });
        });

        describe('handleDraw', () => {
            test('should update the staged annotation with the new scaled shape', () => {
                const shape = getRect();

                instance.scaleShape = jest.fn(value => value);
                instance.handleDraw(shape);

                expect(instance.scaleShape).toHaveBeenCalledWith(shape, true); // Inverse scale
                expect(defaults.setStaged).toHaveBeenCalledWith(expect.objectContaining({ shape }));
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

                expect(defaults.createRegion).toHaveBeenCalledWith({});
            });
        });
    });

    describe('render()', () => {
        test('should render one RegionAnnotation per annotation', () => {
            const wrapper = getWrapper({ annotations });

            expect(wrapper.exists('.ba-RegionAnnotations-list')).toBe(true);
            expect(wrapper.find(RegionAnnotation).length).toBe(3);
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

            expect(wrapper.exists(RegionCreator)).toBe(true);
            expect(wrapper.exists(RegionAnnotation)).toBe(true);
            expect(wrapper.find(RegionAnnotation).props()).toMatchObject({
                isActive: true,
                shape: {
                    height: 75,
                    type: 'rect' as const,
                    width: 75,
                    x: 15,
                    y: 15,
                },
            });
        });

        test('should render a reply popup only if a shape has been fully drawn', () => {
            const wrapper = getWrapper({
                isCreating: true,
                staged: {
                    location: 1,
                    message: 'test',
                    shape: getRect(),
                },
                status: CreatorStatus.staged,
            });
            wrapper.setState({
                targetRef: document.createElement('a'),
            });

            expect(wrapper.find(PopupReply).props()).toMatchObject({
                defaultValue: 'test',
            });
        });

        test('should not render creation components if not in creation mode', () => {
            const wrapper = getWrapper({
                annotations: [],
                isCreating: false,
            });

            expect(wrapper.exists(PopupReply)).toBe(false);
            expect(wrapper.exists(RegionAnnotation)).toBe(false);
            expect(wrapper.exists(RegionCreator)).toBe(false);
        });
    });
});
