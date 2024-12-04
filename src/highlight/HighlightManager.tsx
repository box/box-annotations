import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import BaseManager, { Props } from '../common/BaseManager';
import HighlightContainer from './HighlightContainer';

export default class HighlightManager extends BaseManager {
    decorate(): void {
        this.reactEl.classList.add('ba-Layer--highlight');
        this.reactEl.dataset.testid = 'ba-Layer--highlight';
    }

    render(props: Props): void {
        if (!this.root) {
            this.root = ReactDOM.createRoot(this.reactEl);
        }

        this.root.render(<HighlightContainer location={this.location} {...props} />);
    }
}
