import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import useCustomCursor from '../useCustomCursor';

describe('useCustomCursor', () => {
    const cursorTemplate = '<svg><path fill="{{cursorFillColor}}" /></svg>';
    const color = '#000';

    function TestComponent(): JSX.Element {
        const ref = React.createRef<HTMLDivElement>();

        useCustomCursor(ref, cursorTemplate, color);

        return <div ref={ref} id="test-div" />;
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
    });

    test('should change custom cursor', () => {
        getWrapper();

        const element = document.getElementById('test-div');

        expect(element?.style.cursor).toEqual(
            'url("data:image/svg+xml,%3Csvg%3E%3Cpath%20fill%3D\'%23000\'%20%2F%3E%3C%2Fsvg%3E") 0 0, default',
        );
    });
});
