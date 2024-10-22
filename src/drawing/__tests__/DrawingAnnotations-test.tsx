import * as React from 'react';
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
        canShowPopupToolbar: false,
        color: '#000',
        drawnPathGroups: [],
        isCreating: false,
        location: 0,
        redoDrawingPathGroup: jest.fn(),
        resetDrawing: jest.fn(),
        setActiveAnnotationId: jest.fn(),
        setReferenceId: jest.fn(),
        setStaged: jest.fn(),
        setStatus: jest.fn(),
        setupDrawing: jest.fn(),
        stashedPathGroups: [],
        undoDrawingPathGroup: jest.fn(),
    });
    const getWrapper = (props = {}): ReactWrapper => mount(<DrawingAnnotations {...getDefaults()} {...props} />);
    const {
        target: { path_groups: pathGroups },
    } = annotations[0];

    describe('event handlers', () => {
        describe('handleDelete()', () => {
            test('should dispatch resetDrawing action', () => {
                const resetDrawing = jest.fn();
                const wrapper = getWrapper({
                    canShowPopupToolbar: true,
                    drawnPathGroups: pathGroups,
                    isCreating: true,
                    resetDrawing,
                });

                wrapper.find(PopupDrawingToolbar).prop('onDelete')();

                expect(resetDrawing).toHaveBeenCalled();
            });
        });

        describe('handleRedo()', () => {
            test('should dispatch redoDrawingPathGroup action', () => {
                const redoDrawingPathGroup = jest.fn();
                const wrapper = getWrapper({
                    canShowPopupToolbar: true,
                    drawnPathGroups: pathGroups,
                    isCreating: true,
                    redoDrawingPathGroup,
                });

                wrapper.find(PopupDrawingToolbar).prop('onRedo')();

                expect(redoDrawingPathGroup).toHaveBeenCalled();
            });
        });

        describe('handleReply()', () => {
            test('should dispatch setStaged and setStatus actions', () => {
                const setStaged = jest.fn();
                const setStatus = jest.fn();
                const wrapper = getWrapper({
                    canShowPopupToolbar: true,
                    drawnPathGroups: pathGroups,
                    isCreating: true,
                    setStaged,
                    setStatus,
                });

                wrapper.find(PopupDrawingToolbar).prop('onReply')();

                expect(setStaged).toHaveBeenCalledWith({ location: 0, pathGroups });
                expect(setStatus).toHaveBeenCalledWith(CreatorStatus.staged);
            });
        });

        describe('handleUndo()', () => {
            test('should dispatch undoDrawingPathGroup action', () => {
                const undoDrawingPathGroup = jest.fn();
                const wrapper = getWrapper({
                    canShowPopupToolbar: true,
                    drawnPathGroups: pathGroups,
                    isCreating: true,
                    undoDrawingPathGroup,
                });

                wrapper.find(PopupDrawingToolbar).prop('onUndo')();

                expect(undoDrawingPathGroup).toHaveBeenCalled();
            });
        });

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
                const setStatus = jest.fn();
                const setupDrawing = jest.fn();
                const wrapper = getWrapper({ isCreating: true, resetDrawing, setStatus, setupDrawing });

                React.act(() => {
                    wrapper.find(DrawingCreator).prop('onStart')();
                });

                expect(resetDrawing).not.toHaveBeenCalled();
                expect(setStatus).toHaveBeenCalledWith(CreatorStatus.started);
                expect(setupDrawing).toHaveBeenCalledWith(0);
            });
        });

        describe('handleStop()', () => {
            test('should add path group to existing drawing path groups', () => {
                const addDrawingPathGroup = jest.fn();
                const wrapper = getWrapper({ isCreating: true, addDrawingPathGroup });

                React.act(() => {
                    wrapper.find(DrawingCreator).prop('onStop')(pathGroups[0]);
                });

                expect(addDrawingPathGroup).toHaveBeenCalledWith(pathGroups[0]);
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

        test('should render staged drawing if only drawn path groups exists', () => {
            const wrapper = getWrapper({ drawnPathGroups: pathGroups });

            expect(wrapper.exists(DrawingList)).toBe(true);
            expect(wrapper.exists(DrawingSVG)).toBe(true);
            expect(wrapper.exists(DrawingCreator)).toBe(false);
            expect(wrapper.exists(PopupDrawingToolbar)).toBe(false);
        });

        test('should render staged drawing if only stashed path groups exist', () => {
            const wrapper = getWrapper({ stashedPathGroups: pathGroups });

            expect(wrapper.exists(DrawingList)).toBe(true);
            expect(wrapper.exists(DrawingSVG)).toBe(true);
            expect(wrapper.exists(DrawingCreator)).toBe(false);
            expect(wrapper.exists(PopupDrawingToolbar)).toBe(false);
        });

        test('should apply class if is currently drawing', () => {
            const wrapper = getWrapper({ canShowPopupToolbar: true, isCreating: true, drawnPathGroups: pathGroups });

            expect(wrapper.find(PopupDrawingToolbar).hasClass('ba-is-drawing')).toBe(false);

            React.act(() => {
                wrapper.find(DrawingCreator).prop('onStart')();
            });

            wrapper.update();

            expect(wrapper.find(PopupDrawingToolbar).hasClass('ba-is-drawing')).toBe(true);
        });

        test('should apply selected color', () => {
            const wrapper = getWrapper({ color: '#111', isCreating: true });

            expect(wrapper.find(DrawingCreator).prop('color')).toBe('#111');
        });

        test.each`
            drawn         | stashed       | canComment | canRedo  | canUndo
            ${pathGroups} | ${[]}         | ${true}    | ${false} | ${true}
            ${[]}         | ${pathGroups} | ${false}   | ${true}  | ${false}
            ${pathGroups} | ${pathGroups} | ${true}    | ${true}  | ${true}
        `(
            'should set "can" props appropriately when drawn length is $drawn.length and stashed length is $stashed.length',
            ({ drawn, stashed, canComment, canRedo, canUndo }) => {
                const wrapper = getWrapper({
                    canShowPopupToolbar: true,
                    drawnPathGroups: drawn,
                    isCreating: true,
                    stashedPathGroups: stashed,
                });

                expect(wrapper.find(PopupDrawingToolbar).prop('canComment')).toBe(canComment);
                expect(wrapper.find(PopupDrawingToolbar).prop('canRedo')).toBe(canRedo);
                expect(wrapper.find(PopupDrawingToolbar).prop('canUndo')).toBe(canUndo);
            },
        );
    });

    describe('state changes', () => {
        test.each`
            basePathGroups | nextPathGroups | expected
            ${[]}          | ${[]}          | ${0}
            ${[]}          | ${pathGroups}  | ${1}
            ${pathGroups}  | ${pathGroups}  | ${1}
        `(
            'should call update $expected times if basePathGroups.length is $basePathGroups.length and nextPathGroups.length is $nextPathGroups.length',
            ({ basePathGroups, nextPathGroups, expected }) => {
                const popupRef = { popper: { update: jest.fn() } };
                jest.spyOn(React, 'useRef').mockImplementation(() => ({ current: popupRef }));

                const wrapper = getWrapper({
                    drawnPathGroups: basePathGroups,
                });

                wrapper.setProps({ drawnPathGroups: nextPathGroups });

                expect(popupRef.popper.update).toHaveBeenCalledTimes(expected);
            },
        );
    });
});
