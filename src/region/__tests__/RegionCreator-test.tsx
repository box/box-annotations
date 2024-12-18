import React, { act } from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { mockEvent } from '../../common/__mocks__/events';
import PointerCapture, { Status } from '../../components/PointerCapture';
import PopupCursor from '../../components/Popups/PopupCursor';
import RegionCreator from '../RegionCreator';
import useAutoScroll from '../../common/useAutoScroll';
import { styleShape } from '../regionUtil';

jest.mock('../../common/useAutoScroll');
jest.mock('../../components/Popups/PopupCursor', () => () => <div />);
jest.mock('../RegionRect');
jest.mock('../regionUtil');

describe('RegionCreator', () => {
    const defaults = {
        onAbort: jest.fn(),
        onStart: jest.fn(),
        onStop: jest.fn(),
    };

    const getDOMRect = (x = 0, y = 0, height = 1000, width = 1000): DOMRect => ({
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

    // Render helpers
    const getWrapper = (props = {}): ReactWrapper => mount(<RegionCreator {...defaults} {...props} />);

    beforeEach(() => {
        jest.useFakeTimers();

        jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => getDOMRect());
        jest.spyOn(document, 'addEventListener');
        jest.spyOn(document, 'removeEventListener');
        jest.spyOn(window, 'cancelAnimationFrame');
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => setTimeout(cb, 100)); // 10 fps
    });

    describe('mouse events', () => {
        const simulateDrawStart = (wrapper: ReactWrapper, clientX = 10, clientY = 10): void =>
            act(() => {
                wrapper.simulate('mousedown', { button: 0, clientX, clientY });
            });
        const simulateDrawMove = (clientX = 10, clientY = 10): void =>
            act(() => {
                document.dispatchEvent(new MouseEvent('mousemove', { button: 0, clientX, clientY }));
            });
        const simulateDrawStop = (): void =>
            act(() => {
                document.dispatchEvent(new MouseEvent('mouseup'));
            });

        test('should start the render loop and add all event listeners when starting', () => {
            const wrapper = getWrapper();

            simulateDrawStart(wrapper);
            simulateDrawMove(50, 50);

            expect(document.addEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));
            expect(document.addEventListener).toHaveBeenCalledWith('mouseup', expect.any(Function));
            expect(window.requestAnimationFrame).toHaveBeenCalled();
        });

        test.each`
            x1      | y1      | x2      | y2      | result                                           | comment
            ${0}    | ${0}    | ${1000} | ${1000} | ${{ height: 100, width: 100, x: 0, y: 0 }}       | ${'maximum size'}
            ${0}    | ${0}    | ${1500} | ${1500} | ${{ height: 100, width: 100, x: 0, y: 0 }}       | ${'maximum size (over)'}
            ${100}  | ${100}  | ${105}  | ${105}  | ${{ height: 1, width: 1, x: 10, y: 10 }}         | ${'minimum size'}
            ${50}   | ${50}   | ${100}  | ${100}  | ${{ height: 5, width: 5, x: 5, y: 5 }}           | ${'standard dimensions'}
            ${100}  | ${100}  | ${50}   | ${50}   | ${{ height: 5, width: 5, x: 5, y: 5 }}           | ${'standard dimensions'}
            ${152}  | ${152}  | ${245}  | ${245}  | ${{ height: 9.3, width: 9.3, x: 15.2, y: 15.2 }} | ${'standard dimensions'}
            ${1000} | ${100}  | ${1000} | ${150}  | ${{ height: 5, width: 1, x: 99, y: 10 }}         | ${'maximum position (x)'}
            ${100}  | ${1000} | ${150}  | ${1000} | ${{ height: 1, width: 5, x: 10, y: 99 }}         | ${'maximum position (y)'}
            ${1000} | ${1000} | ${1000} | ${1000} | ${{ height: 1, width: 1, x: 99, y: 99 }}         | ${'maximum position (both)'}
            ${1500} | ${1500} | ${1500} | ${1500} | ${{ height: 1, width: 1, x: 99, y: 99 }}         | ${'maximum position (over)'}
            ${-1}   | ${-1}   | ${10}   | ${10}   | ${{ height: 1, width: 1, x: 0, y: 0 }}           | ${'minimum position'}
        `('should update the rendered rect when the user draws $comment', ({ result, x1, x2, y1, y2 }) => {
            const wrapper = getWrapper();

            simulateDrawStart(wrapper, x1, y1);
            simulateDrawMove(2000, 2000); // First move > 10 pixels to ensure the move is not a click
            simulateDrawMove(x2, y2);
            jest.advanceTimersByTime(1000); // Advance by 10 frames (10 fps * 1 seconds)
            wrapper.update();

            expect(styleShape).toHaveBeenCalledWith({ ...result, type: 'rect' });
        });

        test('should call the onStart and onStop callback when drawing starts and stops', () => {
            const wrapper = getWrapper();

            simulateDrawStart(wrapper, 50, 50);
            simulateDrawMove(100, 100);
            simulateDrawStop();
            jest.advanceTimersByTime(1000);
            wrapper.update();

            expect(defaults.onStart).toHaveBeenCalled();
            expect(defaults.onStop).toHaveBeenCalledWith({
                height: 5,
                type: 'rect',
                width: 5,
                x: 5,
                y: 5,
            });
        });

        test('should call onAbort and not call onStart when user clicks or drags a small distance', () => {
            const wrapper = getWrapper();

            simulateDrawStart(wrapper, 50, 50);
            simulateDrawMove(55, 55);
            simulateDrawStop();
            jest.advanceTimersByTime(1000);
            wrapper.update();

            expect(defaults.onStart).not.toHaveBeenCalled();
            expect(defaults.onStop).not.toHaveBeenCalled();
            expect(defaults.onAbort).toHaveBeenCalled();
        });

        test('should do nothing if primary button is not pressed', () => {
            const wrapper = getWrapper();

            act(() => {
                wrapper.simulate('mousedown', { button: 1, clientX: 50, clientY: 50 });
                document.dispatchEvent(new MouseEvent('mousemove', { button: 1, clientX: 100, clientY: 100 }));
                document.dispatchEvent(new MouseEvent('mouseup', { button: 1, clientX: 100, clientY: 100 }));
            });
            jest.advanceTimersByTime(1000);
            wrapper.update();

            expect(defaults.onStart).not.toHaveBeenCalled();
            expect(defaults.onStop).not.toHaveBeenCalled();
        });

        test('should do nothing if the mouse is moved without being pressed over the wrapper first', () => {
            const wrapper = getWrapper();

            simulateDrawMove(50, 50);
            jest.advanceTimersByTime(1000);
            wrapper.update();

            expect(defaults.onStart).not.toHaveBeenCalled();
            expect(defaults.onStop).not.toHaveBeenCalled();
        });

        test('should prevent click events from surfacing to the parent document', () => {
            const wrapper = getWrapper();

            act(() => {
                wrapper.simulate('click', mockEvent);
            });

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(mockEvent.stopPropagation).toHaveBeenCalled();
        });

        test('should cancel the render loop and cleanup all event handlers when done', () => {
            const wrapper = getWrapper();

            simulateDrawStart(wrapper);
            simulateDrawMove(50, 50);
            simulateDrawStop();

            expect(document.removeEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));
            expect(document.removeEventListener).toHaveBeenCalledWith('mouseup', expect.any(Function));
            expect(window.cancelAnimationFrame).toHaveBeenCalled();
        });

        test('should show cursor popup when mouse over', () => {
            const wrapper = getWrapper();

            act(() => {
                wrapper.simulate('mouseover');
            });
            wrapper.update();
            expect(wrapper.exists(PopupCursor)).toBe(true);

            act(() => {
                wrapper.simulate('mouseout');
            });
            wrapper.update();
            expect(wrapper.exists(PopupCursor)).toBe(false);
        });
    });

    describe('touch events', () => {
        const shape = {
            height: 5,
            type: 'rect',
            width: 5,
            x: 5,
            y: 5,
        };
        const simulateDrawStart = (wrapper: ReactWrapper, clientX = 10, clientY = 10): void =>
            act(() => {
                wrapper.simulate('touchstart', { targetTouches: [{ clientX, clientY }] });
            });
        const simulateDrawMove = (wrapper: ReactWrapper, clientX = 10, clientY = 10): void =>
            act(() => {
                wrapper.simulate('touchmove', { targetTouches: [{ clientX, clientY }] });
            });
        const simulateDrawStop = (wrapper: ReactWrapper): void =>
            act(() => {
                wrapper.simulate('touchend');
            });
        const simulateDrawCancel = (wrapper: ReactWrapper): void =>
            act(() => {
                wrapper.simulate('touchcancel');
            });

        test('should update the rendered rect when the user draws with touch events', () => {
            const wrapper = getWrapper();

            simulateDrawStart(wrapper, 50, 50);
            simulateDrawMove(wrapper, 100, 100);
            jest.advanceTimersByTime(1000);
            wrapper.update();

            expect(styleShape).toHaveBeenCalledWith(shape);
        });

        test('should call the onStart and onStop callback when drawing starts and stops', () => {
            const wrapper = getWrapper();

            simulateDrawStart(wrapper, 50, 50);
            simulateDrawMove(wrapper, 100, 100);
            simulateDrawStop(wrapper);
            jest.advanceTimersByTime(1000);
            wrapper.update();

            expect(defaults.onStart).toHaveBeenCalled();
            expect(defaults.onStop).toHaveBeenCalledWith(shape);
        });

        test('should call the onStart and onStop callback even if drawing is cancelled', () => {
            const wrapper = getWrapper();

            simulateDrawStart(wrapper, 50, 50);
            simulateDrawMove(wrapper, 100, 100);
            simulateDrawCancel(wrapper);
            jest.advanceTimersByTime(1000);
            wrapper.update();

            expect(defaults.onStart).toHaveBeenCalled();
            expect(defaults.onStop).toHaveBeenCalledWith(shape);
        });
    });

    describe('render', () => {
        test('should call useAutoScroll with the necessary options', () => {
            getWrapper();

            expect(useAutoScroll).toHaveBeenCalledWith({
                enabled: false,
                onScroll: expect.any(Function),
                reference: null,
            });
        });

        test('should add class and event listeners', () => {
            const wrapper = getWrapper();
            const rootEl = wrapper.find(PointerCapture);

            expect(rootEl.props()).toMatchObject({
                className: 'ba-RegionCreator',
                onDrawStart: expect.any(Function),
                onDrawStop: expect.any(Function),
                onDrawUpdate: expect.any(Function),
                onMouseOut: expect.any(Function),
                onMouseOver: expect.any(Function),
                status: Status.init,
            });
        });
    });
});
