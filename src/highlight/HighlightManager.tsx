import * as React from 'react';
import * as ReactDOM from 'react-dom';
import HighlightContainer from './HighlightContainer';
import BaseManager, { Manager, Props } from '../common/BaseManager';

export default class HighlightManager extends BaseManager implements Manager {
    decorate(): void {
        this.reactEl.classList.add('ba-Layer--highlight');
        this.reactEl.dataset.testid = 'ba-Layer--highlight';
    }

    render(props: Props): void {
        ReactDOM.render(<HighlightContainer location={this.location} {...props} />, this.reactEl);
    }
}
