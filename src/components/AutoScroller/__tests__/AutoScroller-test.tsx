import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import useAutoScroll from '../AutoScroller';

describe('AutoScroller', () => {
    const TestComponent = (props = {}): JSX.Element => {
        const reference = document.querySelector('#child');

        useAutoScroll({
            enabled: true,
            reference,
            ...props,
        });

        return <></>;
    };
    const getDOMRect = (x: number, y: number, height: number, width: number): DOMRect => ({
        bottom: x + height,
        top: y,
        left: x,
        right: y + width,
        height,
        width,
        toJSON: jest.fn(),
        x,
        y,
    });
    const getParent = (): HTMLElement => {
        const parent = document.getElementById('parent') as HTMLElement;
        const parentRect = getDOMRect(0, 0, 500, 500);

        parent.getBoundingClientRect = jest.fn(() => parentRect);
        parent.style.overflow = 'scroll';

        jest.spyOn(parent, 'scrollHeight', 'get').mockReturnValue(1000);
        jest.spyOn(parent, 'scrollWidth', 'get').mockReturnValue(1000);

        return parent;
    };
    const getWrapper = (props = {}): ReactWrapper => mount(<TestComponent {...props} />);

    beforeEach(() => {
        jest.useFakeTimers();

        jest.spyOn(document, 'addEventListener');
        jest.spyOn(document, 'removeEventListener');
        jest.spyOn(window, 'cancelAnimationFrame');
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => setTimeout(cb, 100)); // 10 fps

        document.body.innerHTML = '<div id="parent"><div id="child"/></div>';
    });

    describe('cleanup', () => {
        test('should remove the event listeners and cancel the scroll check loop when disabled', () => {
            const wrapper = getWrapper();

            wrapper.setProps({ enabled: false });

            expect(document.removeEventListener).toHaveBeenCalledTimes(2);
            expect(window.cancelAnimationFrame).toHaveBeenCalled();
        });

        test('should remove the event listeners and cancel the scroll check loop on unmount', () => {
            const wrapper = getWrapper();

            wrapper.unmount();

            expect(document.removeEventListener).toHaveBeenCalledTimes(2);
            expect(window.cancelAnimationFrame).toHaveBeenCalled();
        });
    });

    describe('event handlers', () => {
        test.each`
            clientX | clientY | startLeft | startTop | stopLeft | stopTop
            ${-50}  | ${-50}  | ${0}      | ${0}     | ${0}     | ${0}
            ${0}    | ${0}    | ${0}      | ${0}     | ${0}     | ${0}
            ${50}   | ${50}   | ${0}      | ${0}     | ${0}     | ${0}
            ${0}    | ${455}  | ${0}      | ${0}     | ${0}     | ${10}
            ${0}    | ${475}  | ${0}      | ${0}     | ${0}     | ${50}
            ${0}    | ${500}  | ${0}      | ${0}     | ${0}     | ${100}
            ${0}    | ${990}  | ${0}      | ${0}     | ${0}     | ${1000}
            ${475}  | ${500}  | ${0}      | ${50}    | ${50}    | ${150}
            ${500}  | ${500}  | ${0}      | ${100}   | ${100}   | ${200}
            ${990}  | ${990}  | ${0}      | ${950}   | ${1000}  | ${1000}
            ${990}  | ${990}  | ${480}    | ${950}   | ${1000}  | ${1000}
            ${990}  | ${990}  | ${480}    | ${950}   | ${1000}  | ${1000}
            ${1500} | ${1500} | ${1000}   | ${1000}  | ${1000}  | ${1000}
        `(
            'should scroll the component parent if a mousemove event is within the scroll boundary',
            ({ clientX, clientY, startLeft, startTop, stopLeft, stopTop }) => {
                const parent = getParent();
                const wrapper = getWrapper();

                parent.scrollLeft = startLeft;
                parent.scrollTop = startTop;

                document.dispatchEvent(
                    new MouseEvent('mousemove', {
                        clientX,
                        clientY,
                    }),
                );

                jest.advanceTimersByTime(1000);

                expect(parent.scrollLeft).toEqual(stopLeft);
                expect(parent.scrollTop).toEqual(stopTop);
                expect(wrapper).toBeTruthy();
            },
        );

        test('should scroll the component parent if a touchmove event is in the scroll boundary', () => {
            const parent = getParent();
            const wrapper = getWrapper();

            parent.scrollLeft = 0;
            parent.scrollTop = 0;

            jest.runAllTicks();

            document.dispatchEvent(
                new TouchEvent('touchmove', {
                    targetTouches: [{ clientX: 0, clientY: 500 } as Touch],
                }),
            );

            jest.advanceTimersByTime(1000);

            expect(parent.scrollLeft).toEqual(0);
            expect(parent.scrollTop).toEqual(100); // SCROLL_GAP * SCROLL_DELTA * 10 (fps)
            expect(wrapper).toBeTruthy();
        });
    });
});
