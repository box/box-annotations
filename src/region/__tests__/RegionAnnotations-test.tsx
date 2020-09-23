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
        location: 1,
        resetCreator: jest.fn(),
        setActiveAnnotationId: jest.fn(),
        setMessage: jest.fn(),
        setReferenceShape: jest.fn(),
        setStaged: jest.fn(),
        setStatus: jest.fn(),
        staged: null,
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

        describe('handleAbort', () => {
            test('should call resetCreator', () => {
                instance.handleAbort();

                expect(defaults.resetCreator).toHaveBeenCalled();
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

        test('should render RegionList before RegionCreator if discoverability is disabled', () => {
            const wrapper = getWrapper({ isCreating: true, isDiscoverabilityEnabled: false });
            expect(wrapper).toMatchInlineSnapshot(`
                <Fragment>
                  <Memo(RegionList)
                    activeId={null}
                    annotations={Array []}
                    className="ba-RegionAnnotations-list"
                    onSelect={[Function]}
                  />
                  <RegionCreator
                    className="ba-RegionAnnotations-creator"
                    onAbort={[Function]}
                    onStart={[Function]}
                    onStop={[Function]}
                  />
                </Fragment>
            `);
        });

        test('should render RegionCreator before RegionList if discoverability is enabled', () => {
            const wrapper = getWrapper({ isCreating: true, isDiscoverabilityEnabled: true });
            expect(wrapper).toMatchInlineSnapshot(`
                <Fragment>
                  <RegionCreator
                    className="ba-RegionAnnotations-creator is-discoverability-enabled"
                    onAbort={[Function]}
                    onStart={[Function]}
                    onStop={[Function]}
                  />
                  <Memo(RegionList)
                    activeId={null}
                    annotations={Array []}
                    className="ba-RegionAnnotations-list"
                    onSelect={[Function]}
                  />
                </Fragment>
            `);
        });
    });

    describe('componentDidUpdate', () => {
        const mockRectRef = {
            getBoundingClientRect: () => ({
                height: 10,
                width: 10,
                top: 10,
                left: 10,
            }),
        };

        test('should call setReferenceShape if current rectRef and staged exist', () => {
            const wrapper = getWrapper({ staged: {} });

            wrapper.setState({ rectRef: mockRectRef });

            expect(defaults.setReferenceShape).toHaveBeenCalled();
        });

        test('should not call setReferenceShape if prev and current rectRef are the same', () => {
            const wrapper = getWrapper();

            wrapper.setProps({ staged: {} });

            expect(defaults.setReferenceShape).not.toHaveBeenCalled();
        });

        test('should not call setReferenceShape if rectRef does not exist', () => {
            const wrapper = getWrapper();

            wrapper.setState({ rectRef: mockRectRef });

            expect(defaults.setReferenceShape).toHaveBeenCalledTimes(1);

            wrapper.setState({ rectRef: undefined });

            expect(defaults.setReferenceShape).toHaveBeenCalledTimes(1);
        });
    });
});
