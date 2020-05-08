import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import useOutsideEvent from '../useOutsideEvent';

describe('src/utils/useOutsideClick', () => {
    let callback: jest.Mock;

    function TestComponent(): JSX.Element {
        const ref = React.createRef<HTMLButtonElement>();

        useOutsideEvent('click', ref, callback);

        return (
            <div id="container">
                <button ref={ref} id="test-button" type="button">
                    <span id="test-span">Test</span>
                </button>
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
        callback = jest.fn();
    });

    test.each`
        elementId        | isCalled
        ${'container'}   | ${true}
        ${'test-button'} | ${false}
        ${'test-span'}   | ${false}
    `('should callback be called if click target is $elementId? $isCalled', ({ elementId, isCalled }) => {
        getWrapper();

        const element: HTMLElement | null = document.getElementById(elementId);
        if (element) {
            element.click();
        }

        expect(element).toBeTruthy();
        expect(callback.mock.calls.length).toBe(isCalled ? 1 : 0);
    });
});
