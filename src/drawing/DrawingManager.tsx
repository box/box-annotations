import * as React from 'react';
import * as ReactDOM from 'react-dom';
import BaseManager, { Props } from '../common/BaseManager';
import DrawingAnnotationsContainer from './DrawingAnnotationsContainer';

export default class DrawingListManager extends BaseManager {
    decorate(): void {
        this.reactEl.classList.add('ba-Layer--drawing');
        this.reactEl.dataset.testid = 'ba-Layer--drawing';
    }

    render(props: Props): void {
        ReactDOM.render(<DrawingAnnotationsContainer location={this.location} {...props} />, this.reactEl);
    }
}
