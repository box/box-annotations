import * as React from 'react';
import * as ReactDOM from 'react-dom';
import BaseManager, { Props } from '../common/BaseManager';
import HighlightContainer from './HighlightContainer';

export default class HighlightManager extends BaseManager {
    decorate(): void {
        this.reactEl.classList.add('ba-Layer--highlight');
        this.reactEl.dataset.testid = 'ba-Layer--highlight';
    }

    render(props: Props): void {
        ReactDOM.render(<HighlightContainer location={this.location} {...props} />, this.reactEl);
    }
}
