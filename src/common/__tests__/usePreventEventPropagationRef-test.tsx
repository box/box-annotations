import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import usePreventEventPropagationRef from '../usePreventEventPropagationRef';

describe('usePreventEventPropagationRef', () => {
    type Props = {
        onClick: () => void;
    };

    function TestComponent({ onClick }: Props): JSX.Element {
        const ref = usePreventEventPropagationRef<HTMLDivElement>('mousedown');

        return (
            <div ref={ref} id="container">
                <button id="test-button" onClick={onClick} type="button">
                    Test Button
                </button>
            </div>
        );
    }

    const defaults = { onClick: jest.fn() };
    const getWrapper = (): ReactWrapper =>
        mount(<TestComponent {...defaults} />, { attachTo: document.getElementById('test') });
    const handleMouseDown = jest.fn();

    beforeEach(() => {
        document.body.innerHTML = '<div id="test"></div>';
        document.addEventListener('mousedown', handleMouseDown);
    });

    test('should prevent click event from propagating to container div', () => {
        const wrapper = getWrapper();

        wrapper.find('#test-button').simulate('click');
        wrapper.find('#test-button').simulate('mousedown');

        expect(defaults.onClick).toHaveBeenCalled();
        expect(handleMouseDown).not.toHaveBeenCalled();
    });
});
