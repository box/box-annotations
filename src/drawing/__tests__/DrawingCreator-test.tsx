import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount, ReactWrapper } from 'enzyme';
import DrawingCreator, { defaultStroke, Props } from '../DrawingCreator';
import DrawingPath from '../DrawingPath';
import DrawingSVG from '../DrawingSVG';
import PointerCapture, { Props as PointerCaptureProps } from '../../components/PointerCapture';

describe('DrawingCreator', () => {
    const getDefaults = (): Props => ({
        onStart: jest.fn(),
        onStop: jest.fn(),
    });
    const getDOMRect = (x = 0, y = 0, height = 100, width = 100): DOMRect => ({
        bottom: y + height,
        top: y,
        left: x,
        right: x + width,
        height,
        width,
        toJSON: jest.fn(),
        x,
        y,
    });
    const getWrapper = (props?: Partial<Props>): ReactWrapper<PointerCaptureProps, {}> =>
        mount(<DrawingCreator {...getDefaults()} {...props} />);

    beforeEach(() => {
        jest.useFakeTimers();

        jest.spyOn(window, 'cancelAnimationFrame');
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => setTimeout(cb, 100)); // 10 fps;
        jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => getDOMRect());
        jest.spyOn(Element.prototype, 'setAttribute');
    });

    const simulateDrawStart = (wrapper: ReactWrapper<PointerCaptureProps, {}>, clientX = 10, clientY = 10): void =>
        act(() => {
            wrapper.prop('onDrawStart')(clientX, clientY);
        });
    const simulateDrawMove = (wrapper: ReactWrapper<PointerCaptureProps, {}>, clientX = 10, clientY = 10): void =>
        act(() => {
            wrapper.prop('onDrawUpdate')(clientX, clientY);
        });
    const simulateDrawStop = (wrapper: ReactWrapper<PointerCaptureProps, {}>): void =>
        act(() => {
            wrapper.prop('onDrawStop')();
        });

    describe('render', () => {
        test('should render PointerCapture', () => {
            const wrapper = getWrapper();

            expect(wrapper.find(PointerCapture).exists()).toBe(true);
            expect(wrapper.find(PointerCapture).prop('className')).toBe('ba-DrawingCreator');
        });

        test('should render DrawingSVG if dragging', () => {
            const wrapper = getWrapper();

            simulateDrawStart(wrapper.find(PointerCapture));

            wrapper.update();

            expect(wrapper.find(PointerCapture).exists()).toBe(true);
            expect(wrapper.find(DrawingSVG).exists()).toBe(true);
        });

        test('should render DrawingSVG if drawing', () => {
            const wrapper = getWrapper();

            simulateDrawMove(wrapper.find(PointerCapture));

            wrapper.update();

            expect(wrapper.find(PointerCapture).exists()).toBe(true);
            expect(wrapper.find(DrawingSVG).exists()).toBe(true);
        });
    });

    describe('onStart()', () => {
        test('should not be called when dragging is detected', () => {
            const onStart = jest.fn();
            const wrapper = getWrapper({ onStart });

            simulateDrawStart(wrapper.find(PointerCapture));

            wrapper.update();

            expect(onStart).not.toHaveBeenCalled();
        });

        test('should be called when drawing is detected', () => {
            const onStart = jest.fn();
            const wrapper = getWrapper({ onStart });

            simulateDrawMove(wrapper.find(PointerCapture));

            wrapper.update();

            expect(onStart).toHaveBeenCalled();
        });
    });

    describe('onStop()', () => {
        test('should be called when drawing stops with the created path group', () => {
            const onStop = jest.fn();
            const wrapper = getWrapper({ onStop });

            simulateDrawStart(wrapper.find(PointerCapture));
            wrapper.update();
            expect(onStop).not.toHaveBeenCalled();

            simulateDrawMove(wrapper.find(PointerCapture), 15, 15);
            wrapper.update();
            expect(onStop).not.toHaveBeenCalled();

            simulateDrawStop(wrapper.find(PointerCapture));
            wrapper.update();
            expect(onStop).toHaveBeenCalledWith({
                paths: [
                    {
                        points: [
                            { x: 10, y: 10 },
                            { x: 15, y: 15 },
                        ],
                    },
                ],
                stroke: defaultStroke,
            });
        });

        test.each`
            x      | y      | expectedX | expectedY
            ${-1}  | ${-1}  | ${4}      | ${4}
            ${110} | ${110} | ${96}     | ${96}
        `(
            'should bound the drawn points ($x, $y) by the boundary of the PointerCapture element',
            ({ x, y, expectedX, expectedY }) => {
                const onStop = jest.fn();
                const wrapper = getWrapper({ onStop });

                simulateDrawStart(wrapper.find(PointerCapture));
                wrapper.update();
                expect(onStop).not.toHaveBeenCalled();

                simulateDrawMove(wrapper.find(PointerCapture), x, y);
                wrapper.update();
                expect(onStop).not.toHaveBeenCalled();

                simulateDrawStop(wrapper.find(PointerCapture));
                wrapper.update();
                expect(onStop).toHaveBeenCalledWith({
                    paths: [
                        {
                            points: [
                                { x: 10, y: 10 },
                                { x: expectedX, y: expectedY },
                            ],
                        },
                    ],
                    stroke: defaultStroke,
                });
            },
        );

        test('should bound the drawn points by the boundary of the PointerCapture element based on the provided stroke size', () => {
            const customStroke = { color: '#000', size: 10 };
            const onStop = jest.fn();
            const wrapper = getWrapper({ onStop, stroke: customStroke });

            simulateDrawStart(wrapper.find(PointerCapture));
            wrapper.update();
            expect(onStop).not.toHaveBeenCalled();

            simulateDrawMove(wrapper.find(PointerCapture), -1, -1);
            wrapper.update();
            expect(onStop).not.toHaveBeenCalled();

            simulateDrawStop(wrapper.find(PointerCapture));
            wrapper.update();
            expect(onStop).toHaveBeenCalledWith({
                paths: [
                    {
                        points: [
                            { x: 10, y: 10 },
                            { x: 10, y: 10 },
                        ],
                    },
                ],
                stroke: customStroke,
            });
        });
    });

    describe('svg path rendering', () => {
        test('should not trigger raf if not drawing', () => {
            getWrapper();

            expect(window.requestAnimationFrame).not.toHaveBeenCalled();
        });

        test('should update svg path if dragging begins', () => {
            const wrapper = getWrapper();

            simulateDrawStart(wrapper.find(PointerCapture));
            wrapper.update();
            jest.advanceTimersByTime(100);

            expect(window.requestAnimationFrame).toHaveBeenCalled();
            expect(
                wrapper
                    .find(DrawingPath)
                    .childAt(0)
                    .getDOMNode()
                    .getAttribute('d'),
            ).toEqual('M 10 10');
        });

        test('should update svg path if drawing', () => {
            const wrapper = getWrapper();

            simulateDrawStart(wrapper.find(PointerCapture));
            simulateDrawMove(wrapper.find(PointerCapture), 15, 15);
            simulateDrawMove(wrapper.find(PointerCapture), 20, 20);

            wrapper.update();

            jest.advanceTimersByTime(100);

            expect(window.requestAnimationFrame).toHaveBeenCalled();
            expect(
                wrapper
                    .find(DrawingPath)
                    .childAt(0)
                    .getDOMNode()
                    .getAttribute('d'),
            ).toEqual('M 10 10 C 12.5 12.5, 15 15, 17.5 17.5');
        });
    });
});
