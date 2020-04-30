import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import useOutsideClick from '../useOutsideClick';

describe('src/utils/useOutsideClick', () => {
    let callback: () => void;

    beforeEach(() => {
        document.body.innerHTML = '<div id="container"></div>';
        callback = jest.fn();
    });

    function TestComponent(): JSX.Element {
        const ref = React.createRef<HTMLButtonElement>();

        useOutsideClick([], ref, callback);

        return (
            <button ref={ref} id="test-button" type="button">
                <span>Test</span>
            </button>
        );
    }

    const getWrapper = (): ReactWrapper =>
        mount(
            <div>
                <TestComponent />
            </div>,
        );

    test('should call provided callback if click target is not contained by the provided reference', () => {
        getWrapper();

        // eslint-disable-next-line no-unused-expressions
        document.getElementById('container')?.click();

        expect(callback).toHaveBeenCalled();
    });

    test('should not call provided callback if click target is contained by the provided reference', () => {
        getWrapper();

        // eslint-disable-next-line no-unused-expressions
        document.getElementById('test-button')?.click();

        expect(callback).not.toHaveBeenCalled();
    });
});
