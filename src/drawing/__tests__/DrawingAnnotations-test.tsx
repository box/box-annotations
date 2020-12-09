import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount, ReactWrapper } from 'enzyme';
import DrawingAnnotations, { Props } from '../DrawingAnnotations';
import DrawingCreator from '../DrawingCreator';
import DrawingList from '../DrawingList';
import DrawingSVG from '../DrawingSVG';
import DrawingSVGGroup from '../DrawingSVGGroup';
import PopupDrawingToolbar from '../../components/Popups/PopupDrawingToolbar';
import { annotations } from '../__mocks__/drawingData';
import { CreatorStatus } from '../../store';

jest.mock('../DrawingList');

describe('DrawingAnnotations', () => {
    const getDefaults = (): Props => ({
        activeAnnotationId: null,
        addDrawingPathGroup: jest.fn(),
        annotations: [],
        drawnPathGroups: [],
        isCreating: false,
        location: 0,
        resetDrawing: jest.fn(),
        setActiveAnnotationId: jest.fn(),
        setDrawingLocation: jest.fn(),
        setReferenceId: jest.fn(),
        setStaged: jest.fn(),
        setStatus: jest.fn(),
        status: CreatorStatus.init,
    });
    const getWrapper = (props = {}): ReactWrapper => mount(<DrawingAnnotations {...getDefaults()} {...props} />);
    const {
        target: { path_groups: pathGroups },
    } = annotations[0];

    describe('event handlers', () => {
        describe('handleAnnotationActive()', () => {
            test('should call setActiveAnnotationId with annotation id', () => {
                const setActiveAnnotationId = jest.fn();
                getWrapper({ setActiveAnnotationId })
                    .find(DrawingList)
                    .prop('onSelect')!('123');

                expect(setActiveAnnotationId).toHaveBeenCalledWith('123');
            });
        });

        describe('handleStart()', () => {
            test('should set status to started and set the location of the drawing', () => {
                const resetDrawing = jest.fn();
                const setDrawingLocation = jest.fn();
                const setStatus = jest.fn();
                const wrapper = getWrapper({ isCreating: true, resetDrawing, setDrawingLocation, setStatus });

                act(() => {
                    wrapper.find(DrawingCreator).prop('onStart')();
                });

                expect(resetDrawing).not.toHaveBeenCalled();
                expect(setStatus).toHaveBeenCalledWith(CreatorStatus.started);
                expect(setDrawingLocation).toHaveBeenCalledWith(0);
            });

            test('should reset drawing if status is already staged', () => {
                const resetDrawing = jest.fn();
                const setDrawingLocation = jest.fn();
                const setStatus = jest.fn();
                const wrapper = getWrapper({
                    isCreating: true,
                    resetDrawing,
                    setDrawingLocation,
                    setStatus,
                    status: CreatorStatus.staged,
                });

                act(() => {
                    wrapper.find(DrawingCreator).prop('onStart')();
                });

                expect(resetDrawing).toHaveBeenCalled();
                expect(setStatus).toHaveBeenCalledWith(CreatorStatus.started);
                expect(setDrawingLocation).toHaveBeenCalledWith(0);
            });
        });

        describe('handleStop()', () => {
            test('should add path group to existing drawing path groups', () => {
                const addDrawingPathGroup = jest.fn();
                const wrapper = getWrapper({ isCreating: true, addDrawingPathGroup });

                act(() => {
                    wrapper.find(DrawingCreator).prop('onStop')(pathGroups[0]);
                });

                expect(addDrawingPathGroup).toHaveBeenCalledWith(pathGroups[0]);
            });
        });

        describe('handleDelete()', () => {
            test('should dispatch resetDrawing action', () => {
                const resetDrawing = jest.fn();
                const wrapper = getWrapper({ drawnPathGroups: pathGroups, isCreating: true, resetDrawing });

                wrapper.find(PopupDrawingToolbar).prop('onDelete')();

                expect(resetDrawing).toHaveBeenCalled();
            });
        });

        describe('handleDrawingMount()', () => {
            test('should dispatch setReference action', () => {
                const setReferenceId = jest.fn();
                const wrapper = getWrapper({ drawnPathGroups: pathGroups, isCreating: true, setReferenceId });

                wrapper.find(DrawingSVGGroup).prop('onMount')!('123');

                expect(setReferenceId).toHaveBeenCalledWith('123');
            });
        });

        describe('handleReply()', () => {
            test('should dispatch setStaged and setStatus actions', () => {
                const setStaged = jest.fn();
                const setStatus = jest.fn();
                const wrapper = getWrapper({ drawnPathGroups: pathGroups, isCreating: true, setStaged, setStatus });

                wrapper.find(PopupDrawingToolbar).prop('onReply')();

                expect(setStaged).toHaveBeenCalledWith({ location: 0, pathGroups });
                expect(setStatus).toHaveBeenCalledWith(CreatorStatus.staged);
            });
        });
    });

    describe('render()', () => {
        test('should render DrawingList with passed props', () => {
            const wrapper = getWrapper({ annotations, activeAnnotationId: '123' });
            const list = wrapper.find(DrawingList);

            expect(list.hasClass('ba-DrawingAnnotations-list')).toBe(true);
            expect(list.prop('activeId')).toBe('123');
            expect(list.prop('annotations').length).toBe(annotations.length);
            expect(wrapper.exists(DrawingSVG)).toBe(false);
            expect(wrapper.exists(DrawingCreator)).toBe(false);
            expect(wrapper.exists(PopupDrawingToolbar)).toBe(false);
        });

        test('should render DrawingCreator if allowed', () => {
            const wrapper = getWrapper({ isCreating: true });

            expect(wrapper.exists(DrawingList)).toBe(true);
            expect(wrapper.exists(DrawingSVG)).toBe(false);
            expect(wrapper.exists(DrawingCreator)).toBe(true);
            expect(wrapper.exists(PopupDrawingToolbar)).toBe(false);
        });

        test('should render staged drawing if present and allowed', () => {
            const wrapper = getWrapper({ drawnPathGroups: pathGroups });

            expect(wrapper.exists(DrawingList)).toBe(true);
            expect(wrapper.exists(DrawingSVG)).toBe(true);
            expect(wrapper.exists(DrawingCreator)).toBe(false);
            expect(wrapper.exists(PopupDrawingToolbar)).toBe(false);
        });

        test('should apply ba-is-faded if is currently drawing', () => {
            const wrapper = getWrapper({ isCreating: true, drawnPathGroups: pathGroups });

            expect(wrapper.find(PopupDrawingToolbar).hasClass('ba-is-faded')).toBe(false);

            act(() => {
                wrapper.find(DrawingCreator).prop('onStart')();
            });

            wrapper.update();

            expect(wrapper.find(PopupDrawingToolbar).hasClass('ba-is-faded')).toBe(true);
        });
    });
});
