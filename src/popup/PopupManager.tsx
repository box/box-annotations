import * as React from 'react';
import * as ReactDOM from 'react-dom';
import BaseManager, { Props } from '../common/BaseManager';
import PopupContainer from './PopupContainer';

export default class PopupManager extends BaseManager {
    decorate(): void {
        this.reactEl.classList.add('ba-Layer--popup');
        this.reactEl.dataset.testid = 'ba-Layer--popup';
    }

    render(props: Props): void {
        ReactDOM.render(<PopupContainer location={this.location} {...props} />, this.reactEl);
    }
}
