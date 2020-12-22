import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { Provider } from 'react-redux';
import useIsListening from '../useIsListening';
import { createStore, CreatorStatus } from '../../store';

describe('useIsListening', () => {
    function TestComponent(): JSX.Element {
        const isListening = useIsListening();

        return <div data-islistening={isListening} data-testid="islistening" />;
    }

    const getWrapper = (store = createStore()): ReactWrapper =>
        mount(
            <Provider store={store}>
                <TestComponent />
            </Provider>,
        );

    test('should be listening by default', () => {
        const wrapper = getWrapper();

        expect(wrapper.find('[data-testid="islistening"]').prop('data-islistening')).toEqual(true);
    });

    test('should not be listening if CreatorStatus is not init', () => {
        const store = createStore({ creator: { status: CreatorStatus.started } });
        const wrapper = getWrapper(store);

        expect(wrapper.find('[data-testid="islistening"]').prop('data-islistening')).toEqual(false);
    });

    test('should not be listening if isSelecting is true', () => {
        const store = createStore({ highlight: { isSelecting: true } });
        const wrapper = getWrapper(store);

        expect(wrapper.find('[data-testid="islistening"]').prop('data-islistening')).toEqual(false);
    });
});
