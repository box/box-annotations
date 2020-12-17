import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import useMountId from '../useMountId';

jest.mock('uuid', () => ({
    v4: () => '123',
}));

describe('useMountId', () => {
    function TestComponent({ onMount }: { onMount: (uuid: string) => void }): JSX.Element {
        const uuid = useMountId(onMount);

        return <div data-testid="uuid" data-uuid={uuid} />;
    }

    const getWrapper = (onMount: (uuid: string) => void): ReactWrapper => mount(<TestComponent onMount={onMount} />);

    test('should render the component with a generated uuid and call the callback with the generated uuid', () => {
        const onMount = jest.fn();
        const wrapper = getWrapper(onMount);

        expect(wrapper.find('[data-testid="uuid"]').prop('data-uuid')).toEqual('123');
        expect(onMount).toHaveBeenCalledWith('123');
    });
});
