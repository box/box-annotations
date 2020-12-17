import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import useMountId from '../useMountId';

type Props = {
    onMount: (uuid: string) => void;
};

describe('useMountId', () => {
    function TestComponent({ onMount }: Props): JSX.Element {
        const uuid = useMountId(onMount);

        return <div data-testid="uuid" data-uuid={uuid} />;
    }

    const getWrapper = (onMount: (uuid: string) => void): ReactWrapper => mount(<TestComponent onMount={onMount} />);

    test('should render the component with a generated uuid and call the callback with the generated uuid', () => {
        const onMount = jest.fn();
        const wrapper = getWrapper(onMount);

        expect(wrapper.find('[data-testid="uuid"]').prop('data-uuid')).toEqual(expect.any(String));
        expect(onMount).toHaveBeenCalledWith(expect.any(String));
    });
});
