import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import usePrevious from '../usePrevious';

describe('usePrevious', () => {
    function TestComponent({ value }: { value: string }): JSX.Element {
        const previousValue = usePrevious(value);

        return (
            <div>
                <div data-testid="current">{value}</div>
                <div data-testid="previous">{previousValue}</div>
            </div>
        );
    }

    const getWrapper = (value: string): ReactWrapper => mount(<TestComponent value={value} />);

    test('should render the current and previous value, if one is present', () => {
        const wrapper = getWrapper('test');

        expect(wrapper.find('[data-testid="current"]').text()).toEqual('test');
        expect(wrapper.find('[data-testid="previous"]').text()).toEqual('');

        wrapper.setProps({ value: 'new!' });

        expect(wrapper.find('[data-testid="current"]').text()).toEqual('new!');
        expect(wrapper.find('[data-testid="previous"]').text()).toEqual('test');
    });
});
