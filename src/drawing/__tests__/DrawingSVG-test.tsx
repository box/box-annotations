import React from 'react';
import { render } from '@testing-library/react';
import { shallow, ShallowWrapper } from 'enzyme';
import DrawingSVG from '../DrawingSVG';
import UniformBlurContext from '../UniformBlurContext';

describe('DrawingSVG', () => {
    const Component = (): JSX.Element => <div>Test</div>;
    const getWrapper = (props = {}): ShallowWrapper =>
        shallow(
            <DrawingSVG {...props}>
                <Component />
            </DrawingSVG>,
        );
    beforeEach(() => {
        jest.spyOn(React, 'useRef').mockImplementation(() => ({
            current: 'ba-DrawingSVG-shadow_123',
        }));
    });

    describe('render()', () => {
        test('should render svg, filter, and children', () => {
            const wrapper = getWrapper();

            expect(wrapper.hasClass('ba-DrawingSVG')).toBe(true);
            expect(wrapper.find('filter').prop('id')).toBe('ba-DrawingSVG-shadow_123');
            expect(wrapper.exists('feGaussianBlur')).toBe(true);
            expect(wrapper.exists(Component)).toBe(true);
        });

        test('should blur 1 unit of the stretched viewBox on both axes by default', () => {
            const wrapper = getWrapper();

            expect(wrapper.find('feGaussianBlur').prop('stdDeviation')).toBe('1');
        });
    });
});

describe('DrawingSVG with uniform blur', () => {
    let resizeCallback: ResizeObserverCallback;
    const observer = { disconnect: jest.fn(), observe: jest.fn() };
    const setSize = (width: number, height: number): void => {
        jest.spyOn(SVGElement.prototype, 'getBoundingClientRect').mockReturnValue({ height, width } as DOMRect);
    };
    const getDeviation = (container: HTMLElement): string | null | undefined =>
        container.querySelector('feGaussianBlur')?.getAttribute('stdDeviation');

    beforeEach(() => {
        window.ResizeObserver = jest.fn().mockImplementation((callback: ResizeObserverCallback) => {
            resizeCallback = callback;
            return observer;
        });
    });

    test('should not measure without the setting', () => {
        const { container } = render(<DrawingSVG>{null}</DrawingSVG>);

        expect(window.ResizeObserver).not.toHaveBeenCalled();
        expect(getDeviation(container)).toBe('1');
    });

    test('should scale the y deviation so the blur is the same in pixels on both axes', () => {
        // A long HTML page: 1% of the height would be about 1,058px of blur against 11.6px across
        setSize(1155, 105822);

        const { container } = render(
            <UniformBlurContext.Provider value>
                <DrawingSVG>{null}</DrawingSVG>
            </UniformBlurContext.Provider>,
        );

        expect(getDeviation(container)).toBe(`1 ${1155 / 105822}`);
        expect(observer.observe).toHaveBeenCalledWith(container.querySelector('svg'));
    });

    test('should measure again when the layer changes size, and stop when unmounted', () => {
        setSize(1155, 105822);
        const ref = React.createRef<SVGSVGElement>();
        const { container, unmount } = render(
            <UniformBlurContext.Provider value>
                <DrawingSVG ref={ref}>{null}</DrawingSVG>
            </UniformBlurContext.Provider>,
        );

        setSize(1000, 500);
        React.act(() => resizeCallback([], observer as unknown as ResizeObserver));

        expect(getDeviation(container)).toBe('1 2');
        expect(ref.current).toBe(container.querySelector('svg'));

        unmount();
        expect(observer.disconnect).toHaveBeenCalled();
    });
});
