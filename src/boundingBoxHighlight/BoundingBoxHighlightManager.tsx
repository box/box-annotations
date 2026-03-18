import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import BaseManager, { Props } from '../common/BaseManager';
import BoundingBoxHighlightContainer from './BoundingBoxHighlightContainer';

export default class BoundingBoxHighlightManager extends BaseManager {
    decorate(): void {
        this.reactEl.classList.add('ba-Layer--boundingBoxHighlight');
        this.reactEl.dataset.testid = 'ba-Layer--boundingBoxHighlight';
    }

    render(props: Props): void {
        if (!this.root) {
            this.root = ReactDOM.createRoot(this.reactEl);
        }

        this.root.render(<BoundingBoxHighlightContainer location={this.location} {...props} />);
    }
}
