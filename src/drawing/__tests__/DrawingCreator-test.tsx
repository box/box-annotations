import React, { MutableRefObject } from 'react';
import noop from 'lodash/noop';
import { shallow, ShallowWrapper } from 'enzyme';
import DrawingCreator, { defaultStroke, Props } from '../DrawingCreator';
import DrawingSVG from '../DrawingSVG';
import PointerCapture, { Status } from '../../components/PointerCapture';
import { Position } from '../../@types';
import { DrawingPathRef } from '../DrawingPath';

describe('DrawingCreator', () => {
    const creatorEl = { getBoundingClientRect: () => ({ height: 100, left: 0, top: 0, width: 100 }) };
    const getDefaults = (): Props => ({
        onStart: jest.fn(),
        onStop: jest.fn(),
    });
    const getWrapper = (props?: Partial<Props>): ShallowWrapper =>
        shallow(<DrawingCreator {...getDefaults()} {...props} />);
    const setDrawingStatus = jest.fn();
    let capturedPointsRef: MutableRefObject<Array<Position>> = { current: [] };
    let creatorRef = { current: creatorEl };
    let drawignDirtyRef = { current: false };
    let drawingPathRef: MutableRefObject<DrawingPathRef | null> = { current: null };
    let drawingSVGRef = { current: null };
    let renderHandlerRef = { current: null };

    beforeEach(() => {
        capturedPointsRef = { current: [] };
        creatorRef = { current: creatorEl };
        drawignDirtyRef = { current: false };
        drawingPathRef = { current: null };
        drawingSVGRef = { current: null };
        renderHandlerRef = { current: null };

        jest.spyOn(React, 'useState').mockImplementation(() => [Status.init, setDrawingStatus]);
        jest.spyOn(React, 'useEffect').mockImplementation(noop);
        jest.spyOn(React, 'useRef')
            .mockImplementation(() => React.createRef())
            .mockReturnValueOnce(capturedPointsRef)
            .mockReturnValueOnce(creatorRef)
            .mockReturnValueOnce(drawignDirtyRef)
            .mockReturnValueOnce(drawingPathRef)
            .mockReturnValueOnce(drawingSVGRef)
            .mockReturnValueOnce(renderHandlerRef);
    });

    describe('render', () => {
        test('should render PointerCapture', () => {
            const wrapper = getWrapper();

            expect(wrapper.find(PointerCapture).exists()).toBe(true);
            expect(wrapper.find(PointerCapture).prop('className')).toBe('ba-DrawingCreator');
        });

        test.each`
            status             | exists
            ${Status.init}     | ${false}
            ${Status.dragging} | ${false}
            ${Status.drawing}  | ${true}
        `('should render DrawingSVG if status=$status? $exists', ({ status, exists }) => {
            jest.spyOn(React, 'useState').mockImplementationOnce(() => [status, setDrawingStatus]);
            const wrapper = getWrapper();

            expect(wrapper.find(PointerCapture).exists()).toBe(true);
            expect(wrapper.find(DrawingSVG).exists()).toBe(exists);
        });
    });

    describe('drawing', () => {
        test('should trigger start logic on draw start', () => {
            const wrapper = getWrapper();

            wrapper.find(PointerCapture).prop('onDrawStart')(1, 2);

            expect(setDrawingStatus).toHaveBeenCalledWith(Status.dragging);
        });

        test('should invoke onStart callback on draw update', () => {
            const onStart = jest.fn();
            const wrapper = getWrapper({ onStart });

            wrapper.find(PointerCapture).prop('onDrawUpdate')(2, 3);

            expect(setDrawingStatus).toHaveBeenCalledWith(Status.drawing);
            expect(capturedPointsRef.current).toEqual([{ x: 2, y: 3 }]);
            expect(onStart).toHaveBeenCalled();
        });

        test('should invoke onStop callback on draw stop', () => {
            const onStop = jest.fn();
            const wrapper = getWrapper({ onStop });
            const points = [
                { x: 1, y: 2 },
                { x: 2, y: 3 },
            ];
            capturedPointsRef.current = points;

            wrapper.find(PointerCapture).prop('onDrawStop')();

            expect(setDrawingStatus).toHaveBeenCalledWith(Status.init);
            expect(capturedPointsRef.current).toEqual([]);
            expect(onStop).toHaveBeenCalledWith({ paths: [{ points }], stroke: defaultStroke });
        });
    });

    describe('raf', () => {
        beforeEach(() => {
            jest.useFakeTimers();

            jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => setTimeout(cb, 100)); // 10 fps;
            jest.spyOn(React, 'useEffect').mockImplementation(f => f());
        });

        test.each([Status.dragging, Status.drawing])('should invoke requestAnimationFrame if status is %s', status => {
            jest.spyOn(React, 'useState').mockImplementationOnce(() => [status, setDrawingStatus]);

            getWrapper();

            expect(renderHandlerRef.current).toBeDefined();
            expect(window.requestAnimationFrame).toHaveBeenCalled();
        });

        test('should not invoke requestAnimationFrame if status is init', () => {
            getWrapper();

            expect(renderHandlerRef.current).toBe(null);
            expect(window.requestAnimationFrame).not.toHaveBeenCalled();
        });

        describe('renderPath()', () => {
            test('should update the svgPath on the next animation frame if the drawing is dirty', () => {
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const points = [
                    { x: 1, y: 2 },
                    { x: 2, y: 3 },
                ];

                jest.spyOn(React, 'useState').mockImplementationOnce(() => [Status.dragging, setDrawingStatus]);

                getWrapper();

                jest.spyOn(path, 'setAttribute');

                drawingPathRef.current = path;
                drawignDirtyRef.current = true;
                capturedPointsRef.current = points;

                jest.advanceTimersByTime(100); // first animation frame will update the svg path

                expect(drawignDirtyRef.current).toBe(false);
                expect(path.setAttribute).toHaveBeenCalledTimes(1);

                jest.advanceTimersByTime(100); // second animation frame will do nothing because the drawing is not dirty

                expect(drawignDirtyRef.current).toBe(false);
                expect(path.setAttribute).toHaveBeenCalledTimes(1);
            });
        });
    });
});
