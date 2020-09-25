import * as React from 'react';
import { act } from 'react-dom/test-utils';
import { mount, ReactWrapper } from 'enzyme';
import useWindowSize from '../useWindowSize';

describe('useWindowSize', () => {
    function TestComponent(): JSX.Element {
        const windowSize = useWindowSize();

        return (
            <div id="container">
                <span id="height">{windowSize?.height}</span>
                <span id="width">{windowSize?.width}</span>
            </div>
        );
    }

    const getWrapper = (): ReactWrapper =>
        mount(
            <div>
                <TestComponent />
            </div>,
            { attachTo: document.getElementById('test') },
        );

    beforeEach(() => {
        document.body.innerHTML = '<div id="test"></div>';
        global.window.innerHeight = 100;
        global.window.innerWidth = 100;
    });

    test('should return the window size', () => {
        const wrapper = getWrapper();

        expect(wrapper.find('#height').text()).toBe('100');
        expect(wrapper.find('#width').text()).toBe('100');

        global.window.innerHeight = 200;
        global.window.innerWidth = 200;

        act(() => {
            global.window.dispatchEvent(new Event('resize'));
        });

        expect(wrapper.find('#height').text()).toBe('200');
        expect(wrapper.find('#width').text()).toBe('200');
    });
});
