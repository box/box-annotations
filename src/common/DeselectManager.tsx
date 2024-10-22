import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
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
        this.reactEl.classList.add('ba-Layer--deselect');
        this.reactEl.dataset.testid = 'ba-Layer--deselect';
    }

    render({ store }: Props): void {
        if (!this.root) {
            this.root = ReactDOM.createRoot(this.reactEl);
        }

        this.root.render(
            <Provider store={store}>
                <DeselectListener />
            </Provider>,
        );
    }
}
