import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import BaseManager, { Props } from '../common/BaseManager';
import DrawingAnnotationsContainer from './DrawingAnnotationsContainer';

export default class DrawingListManager extends BaseManager {
    decorate(): void {
        this.reactEl.classList.add('ba-Layer--drawing');
        this.reactEl.dataset.testid = 'ba-Layer--drawing';
    }

    render(props: Props): void {
        if (!this.root) {
            this.root = ReactDOM.createRoot(this.reactEl);
        }

        this.root.render(<DrawingAnnotationsContainer location={this.location} {...props} />);
    }
}
