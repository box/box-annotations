import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import BaseManager from './BaseManager';
import MouseeventListener from './MouseeventListener';

export type Options = {
    referenceEl: HTMLElement;
};

export type Props = {
    store: Store;
};

export default class MouseeventManager extends BaseManager {
    decorate(): void {
        this.reactEl.classList.add('ba-Layer--mouseevents');
        this.reactEl.dataset.testid = 'ba-Layer--mouseevents';
    }

    render({ store }: Props): void {
        ReactDOM.render(
            <Provider store={store}>
                <MouseeventListener />
            </Provider>,
            this.reactEl,
        );
    }
}
