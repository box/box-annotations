import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import DrawingAnnotations, { Props } from '../DrawingAnnotations';
import DrawingCreator from '../DrawingCreator';
import DrawingList from '../DrawingList';
import DrawingSVG from '../DrawingSVG';
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
        setActiveAnnotationId: jest.fn(),
        setDrawingLocation: jest.fn(),
        setStatus: jest.fn(),
    });
    const getWrapper = (props = {}): ShallowWrapper => shallow(<DrawingAnnotations {...getDefaults()} {...props} />);
    const setStagedRootEl = jest.fn();
    const {
        target: { path_groups: pathGroups },
    } = annotations[0];
    const uuidRef = React.createRef();

    beforeEach(() => {
        jest.spyOn(React, 'useState').mockImplementation(() => [null, setStagedRootEl]);
        jest.spyOn(React, 'useRef').mockImplementation(() => uuidRef);
    });

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
                const setDrawingLocation = jest.fn();
                const setStatus = jest.fn();
                const wrapper = getWrapper({ isCreating: true, setDrawingLocation, setStatus });

                wrapper.find(DrawingCreator).prop('onStart')();

                expect(setStatus).toHaveBeenCalledWith(CreatorStatus.started);
                expect(setDrawingLocation).toHaveBeenCalledWith(0);
            });
        });

        describe('handleStop()', () => {
            test('should add path group to existing drawing path groups', () => {
                const addDrawingPathGroup = jest.fn();
                const wrapper = getWrapper({ isCreating: true, addDrawingPathGroup });

                wrapper.find(DrawingCreator).prop('onStop')(pathGroups[0]);

                expect(addDrawingPathGroup).toHaveBeenCalledWith(pathGroups[0]);
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
            expect(wrapper.find(DrawingSVG).exists()).toBe(false);
            expect(wrapper.find(DrawingCreator).exists()).toBe(false);
        });

        test('should render DrawingCreator if allowed', () => {
            const wrapper = getWrapper({ isCreating: true });

            expect(wrapper.find(DrawingList).exists()).toBe(true);
            expect(wrapper.find(DrawingSVG).exists()).toBe(false);
            expect(wrapper.find(DrawingCreator).exists()).toBe(true);
        });

        test('should render staged drawing if present and allowed', () => {
            const wrapper = getWrapper({ drawnPathGroups: pathGroups });

            expect(wrapper.find(DrawingList).exists()).toBe(true);
            expect(wrapper.find(DrawingSVG).exists()).toBe(true);
        });
    });
});
