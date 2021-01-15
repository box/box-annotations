import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import BaseManager from './BaseManager';
import DeselectListener from './DeselectListener';

export type Options = {
    referenceEl: HTMLElement;
};

export type Props = {
    store: Store;
};

export default class DeselectManager extends BaseManager {
    decorate(): void {
        this.reactEl.classList.add('ba-Layer--mouseevents');
        this.reactEl.dataset.testid = 'ba-Layer--mouseevents';
    }

    render({ store }: Props): void {
        ReactDOM.render(
            <Provider store={store}>
                <DeselectListener />
            </Provider>,
            this.reactEl,
        );
    }
}
