import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import BaseManager, { Props } from '../common/BaseManager';
import PopupContainer from './PopupContainer';

export default class PopupManager extends BaseManager {
    decorate(): void {
        this.reactEl.classList.add('ba-Layer--popup');
        this.reactEl.dataset.testid = 'ba-Layer--popup';
    }

    render(props: Props): void {
        if (!this.root) {
            this.root = ReactDOM.createRoot(this.reactEl);
        }
       
        this.root.render(<PopupContainer location={this.location}  {...props} targetType={this.targetType} />);
    }
}
